import {defineSchema, defineTable} from 'convex/server';
import {v} from 'convex/values';

export const canvasKind = v.union(v.literal('html'), v.literal('react'));

export default defineSchema({
  /**
   * A canvas is an artifact: source plus the metadata needed to render it.
   * Convex is the source of truth — every view renders from this row, so a
   * write here hot-updates every open preview.
   */
  canvases: defineTable({
    // Short, URL-safe public id. Shared links use this, not the Convex _id.
    slug: v.string(),
    title: v.string(),
    kind: canvasKind,
    source: v.string(),
    // Bumped on every source write. Lets clients tell a local echo from a
    // remote edit without diffing the whole document.
    version: v.number(),
    updatedAt: v.number(),
    // Visitor id of the last writer, so a client can ignore its own echo.
    updatedBy: v.optional(v.string()),
  })
    .index('by_slug', ['slug'])
    .index('by_updatedAt', ['updatedAt']),

  /**
   * Best-effort presence. Rows are written by a heartbeat and swept by the
   * next heartbeat, so a client that closes the tab without cleanup ages out.
   */
  presence: defineTable({
    canvasId: v.id('canvases'),
    visitorId: v.string(),
    name: v.string(),
    lastSeenAt: v.number(),
  })
    .index('by_canvas', ['canvasId'])
    .index('by_canvas_visitor', ['canvasId', 'visitorId']),
});
