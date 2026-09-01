import {v} from 'convex/values';
import {query, mutation} from './_generated/server';
import {canvasBySlug} from './canvases';

/** A row older than this is treated as gone. */
export const PRESENCE_TTL_MS = 30_000;

const presenceRow = v.object({
  visitorId: v.string(),
  name: v.string(),
  lastSeenAt: v.number(),
});

/**
 * Returns every presence row for the canvas. Deliberately does not filter on
 * the current time: a query that reads the clock can never be cached or
 * reused, so the caller drops rows older than PRESENCE_TTL_MS instead.
 */
export const forCanvas = query({
  args: {slug: v.string()},
  returns: v.array(presenceRow),
  handler: async (ctx, args) => {
    const canvas = await canvasBySlug(ctx, args.slug);
    if (canvas === null) {
      return [];
    }

    const rows = await ctx.db
      .query('presence')
      .withIndex('by_canvas', (q) => q.eq('canvasId', canvas._id))
      .collect();

    return rows.map(({visitorId, name, lastSeenAt}) => ({
      visitorId,
      name,
      lastSeenAt,
    }));
  },
});

export const heartbeat = mutation({
  args: {
    slug: v.string(),
    visitorId: v.string(),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await canvasBySlug(ctx, args.slug);
    if (canvas === null) {
      return null;
    }

    const now = Date.now();
    const existing = await ctx.db
      .query('presence')
      .withIndex('by_canvas_visitor', (q) =>
        q.eq('canvasId', canvas._id).eq('visitorId', args.visitorId),
      )
      .unique();

    if (existing === null) {
      await ctx.db.insert('presence', {
        canvasId: canvas._id,
        visitorId: args.visitorId,
        name: args.name,
        lastSeenAt: now,
      });
    } else {
      await ctx.db.patch(existing._id, {name: args.name, lastSeenAt: now});
    }

    // Sweep rows from tabs that went away without saying goodbye. Doing it
    // here keeps presence self-healing without a cron.
    const stale = await ctx.db
      .query('presence')
      .withIndex('by_canvas', (q) => q.eq('canvasId', canvas._id))
      .collect();
    for (const row of stale) {
      if (row.visitorId !== args.visitorId && now - row.lastSeenAt > PRESENCE_TTL_MS * 2) {
        await ctx.db.delete(row._id);
      }
    }

    return null;
  },
});

export const leave = mutation({
  args: {slug: v.string(), visitorId: v.string()},
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await canvasBySlug(ctx, args.slug);
    if (canvas === null) {
      return null;
    }

    const existing = await ctx.db
      .query('presence')
      .withIndex('by_canvas_visitor', (q) =>
        q.eq('canvasId', canvas._id).eq('visitorId', args.visitorId),
      )
      .unique();

    if (existing !== null) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
