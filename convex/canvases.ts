import {v} from 'convex/values';
import {query, mutation, internalMutation} from './_generated/server';
import type {MutationCtx, QueryCtx} from './_generated/server';
import type {Doc} from './_generated/dataModel';
import {canvasKind, canvasVisibility} from './schema';
import {generateSlug, starterFor} from './lib/templates';

const MAX_SOURCE_BYTES = 512 * 1024;

const canvasDoc = v.object({
  _id: v.id('canvases'),
  _creationTime: v.number(),
  slug: v.string(),
  title: v.string(),
  kind: canvasKind,
  source: v.string(),
  version: v.number(),
  updatedAt: v.number(),
  updatedBy: v.optional(v.string()),
  visibility: v.optional(canvasVisibility),
  description: v.optional(v.string()),
});

const canvasSummary = v.object({
  _id: v.id('canvases'),
  slug: v.string(),
  title: v.string(),
  kind: canvasKind,
  version: v.number(),
  updatedAt: v.number(),
  visibility: v.optional(canvasVisibility),
});

const canvasMeta = v.object({
  slug: v.string(),
  title: v.string(),
  kind: canvasKind,
  visibility: v.optional(canvasVisibility),
  description: v.optional(v.string()),
  updatedAt: v.number(),
});

export async function canvasBySlug(
  ctx: QueryCtx | MutationCtx,
  slug: string,
): Promise<Doc<'canvases'> | null> {
  return await ctx.db
    .query('canvases')
    .withIndex('by_slug', (q) => q.eq('slug', slug))
    .unique();
}

/** Slugs are random; retry on the rare collision rather than trusting luck. */
async function uniqueSlug(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = generateSlug();
    if ((await canvasBySlug(ctx, slug)) === null) {
      return slug;
    }
  }
  throw new Error('Could not allocate a unique canvas slug');
}

function assertSourceFits(source: string): void {
  if (source.length > MAX_SOURCE_BYTES) {
    throw new Error(
      `Source is too large (${source.length} chars, limit ${MAX_SOURCE_BYTES})`,
    );
  }
}

export const list = query({
  args: {},
  returns: v.array(canvasSummary),
  handler: async (ctx) => {
    const canvases = await ctx.db
      .query('canvases')
      .withIndex('by_updatedAt')
      .order('desc')
      .take(60);

    return canvases.map(
      ({_id, slug, title, kind, version, updatedAt, visibility}) => ({
        _id,
        slug,
        title,
        kind,
        version,
        updatedAt,
        visibility,
      }),
    );
  },
});

/** List public canvases for sitemap generation (metadata only). */
export const listPublic = query({
  args: {},
  returns: v.array(canvasMeta),
  handler: async (ctx) => {
    const canvases = await ctx.db
      .query('canvases')
      .withIndex('by_visibility')
      .filter((q) => q.eq(q.field('visibility'), 'public'))
      .order('desc')
      .take(1000);

    return canvases.map(
      ({slug, title, kind, visibility, description, updatedAt}) => ({
        slug,
        title,
        kind,
        visibility,
        description,
        updatedAt,
      }),
    );
  },
});

/** Get canvas metadata for SEO (without source). */
export const getMetaBySlug = query({
  args: {slug: v.string()},
  returns: v.union(canvasMeta, v.null()),
  handler: async (ctx, args) => {
    const canvas = await canvasBySlug(ctx, args.slug);
    if (!canvas) return null;
    return {
      slug: canvas.slug,
      title: canvas.title,
      kind: canvas.kind,
      visibility: canvas.visibility,
      description: canvas.description,
      updatedAt: canvas.updatedAt,
    };
  },
});

export const getBySlug = query({
  args: {slug: v.string()},
  returns: v.union(canvasDoc, v.null()),
  handler: async (ctx, args) => {
    return await canvasBySlug(ctx, args.slug);
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    // Defaults to markdown. html/react still accepted for older clients.
    kind: v.optional(canvasKind),
    source: v.optional(v.string()),
  },
  returns: v.object({slug: v.string()}),
  handler: async (ctx, args) => {
    const kind = args.kind ?? 'markdown';
    const source = args.source ?? starterFor(kind);
    assertSourceFits(source);

    const slug = await uniqueSlug(ctx);
    const title = args.title?.trim() || 'Untitled canvas';

    await ctx.db.insert('canvases', {
      slug,
      title,
      kind,
      source,
      version: 1,
      updatedAt: Date.now(),
    });

    return {slug};
  },
});

/**
 * Replace the source of a canvas. Every open preview re-renders from this
 * write, which is what makes a second tab track the first.
 */
export const setSource = mutation({
  args: {
    slug: v.string(),
    source: v.string(),
    editorId: v.optional(v.string()),
  },
  returns: v.object({version: v.number()}),
  handler: async (ctx, args) => {
    assertSourceFits(args.source);

    const canvas = await canvasBySlug(ctx, args.slug);
    if (canvas === null) {
      throw new Error(`No canvas with slug "${args.slug}"`);
    }

    // Skip the write when nothing changed so we do not bump the version and
    // churn every subscriber for a no-op keystroke.
    if (canvas.source === args.source) {
      return {version: canvas.version};
    }

    const version = canvas.version + 1;
    await ctx.db.patch(canvas._id, {
      source: args.source,
      version,
      updatedAt: Date.now(),
      updatedBy: args.editorId,
    });

    return {version};
  },
});

export const rename = mutation({
  args: {slug: v.string(), title: v.string()},
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await canvasBySlug(ctx, args.slug);
    if (canvas === null) {
      throw new Error(`No canvas with slug "${args.slug}"`);
    }

    await ctx.db.patch(canvas._id, {
      title: args.title.trim() || 'Untitled canvas',
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: {slug: v.string()},
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await canvasBySlug(ctx, args.slug);
    if (canvas === null) {
      return null;
    }

    const presence = await ctx.db
      .query('presence')
      .withIndex('by_canvas', (q) => q.eq('canvasId', canvas._id))
      .collect();
    for (const row of presence) {
      await ctx.db.delete(row._id);
    }

    await ctx.db.delete(canvas._id);
    return null;
  },
});

/** Used by the HTTP push endpoint, which runs as an action. */
export const pushSource = internalMutation({
  args: {
    slug: v.string(),
    source: v.string(),
    editorId: v.optional(v.string()),
  },
  returns: v.object({version: v.number()}),
  handler: async (ctx, args) => {
    assertSourceFits(args.source);

    const canvas = await canvasBySlug(ctx, args.slug);
    if (canvas === null) {
      throw new Error(`No canvas with slug "${args.slug}"`);
    }

    const version = canvas.version + 1;
    await ctx.db.patch(canvas._id, {
      source: args.source,
      version,
      updatedAt: Date.now(),
      updatedBy: args.editorId ?? 'http',
    });

    return {version};
  },
});
