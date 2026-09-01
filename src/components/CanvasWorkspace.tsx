'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {useMutation, useQuery} from 'convex/react';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  VStack,
} from '@astryxdesign/core/Layout';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Text} from '@astryxdesign/core/Text';
import {api} from '@/../convex/_generated/api';
import {buildPreviewDocument} from '@/lib/preview';
import {useViewer} from '@/lib/identity';
import {IslandNav} from '@/components/IslandNav';

/** Mirrors PRESENCE_TTL_MS in convex/presence.ts. */
const PRESENCE_TTL_MS = 30_000;
const SAVE_DEBOUNCE_MS = 400;
const PREVIEW_DEBOUNCE_MS = 250;
const HEARTBEAT_MS = 10_000;

// Layout height="fill" resolves against a definite height, and the host
// document does not set one, so the page anchors the viewport height itself.
const pageStyle: CSSProperties = {height: '100dvh'};
const workspaceBodyStyle: CSSProperties = {flex: 1, minHeight: 0};

// A full-bleed code surface. Astryx TextArea is a bordered, labelled form
// field, which is the wrong shape for an editor that owns its whole pane.
const editorStyle: CSSProperties = {
  flex: 1,
  width: '100%',
  height: '100%',
  minHeight: 0,
  padding: 'var(--spacing-4)',
  border: 0,
  outline: 'none',
  resize: 'none',
  backgroundColor: 'var(--color-background-body)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--font-size-sm)',
  lineHeight: 1.65,
  tabSize: 2,
  whiteSpace: 'pre',
  overflow: 'auto',
};

// The preview is an iframe, which has no Astryx equivalent. White base so a
// canvas that sets no background of its own still reads as a page.
const frameStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  border: 0,
  backgroundColor: '#fff',
};

const fillStyle: CSSProperties = {height: '100%', minHeight: 0};

type SaveStatus = 'clean' | 'pending' | 'synced';

export function CanvasWorkspace({slug}: {slug: string}) {
  const viewer = useViewer();
  const canvas = useQuery(api.canvases.getBySlug, {slug});
  const presence = useQuery(api.presence.forCanvas, {slug});
  const setSource = useMutation(api.canvases.setSource);
  const heartbeat = useMutation(api.presence.heartbeat);
  const leave = useMutation(api.presence.leave);

  // Running tool is the default surface. Source stays collapsed until
  // someone opens it from the quiet overflow. No autoSaveId — a prior
  // "source open" preference must not turn the page back into an editor.
  const split = useResizable({
    defaultSize: '40%',
    minSizePx: 280,
    collapsible: true,
    defaultIsCollapsed: true,
  });

  const [draft, setDraft] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('clean');
  const [copied, setCopied] = useState(false);
  // Highest document version this tab has accounted for. Without it, our own
  // write coming back through the subscription looks like a remote edit and
  // would reset the cursor mid-keystroke.
  const [seenVersion, setSeenVersion] = useState(0);
  // Clock for ageing out presence rows. Held in state so nothing reads the
  // real clock during render.
  const [now, setNow] = useState(0);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Follow the document. Convex is the source of truth, so a write from any
  // other view lands here and replaces what this editor is showing. This is
  // the documented way to adjust state when subscribed data changes: derive it
  // during render, guarded so it runs once per new version.
  if (canvas && canvas.version > seenVersion) {
    setSeenVersion(canvas.version);

    const isOwnEcho = viewer !== null && canvas.updatedBy === viewer.id;
    if (draft === null || (!isOwnEcho && canvas.source !== draft)) {
      setDraft(canvas.source);
    }
    if (previewSource === null) {
      setPreviewSource(canvas.source);
    }
  }

  // Rebuild the frame a beat after typing stops, so a keystroke does not tear
  // down and re-run the whole preview document.
  useEffect(() => {
    if (draft === null || draft === previewSource) return;
    const timer = setTimeout(() => setPreviewSource(draft), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, previewSource]);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 5_000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;

    let active = true;
    const beat = () => {
      if (active) {
        void heartbeat({slug, visitorId: viewer.id, name: viewer.name});
      }
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    return () => {
      active = false;
      clearInterval(interval);
      void leave({slug, visitorId: viewer.id});
    };
  }, [slug, viewer, heartbeat, leave]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const handleChange = useCallback(
    (next: string) => {
      setDraft(next);
      setStatus('pending');

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void setSource({slug, source: next, editorId: viewer?.id}).then(() =>
          setStatus('synced'),
        );
      }, SAVE_DEBOUNCE_MS);
    },
    [setSource, slug, viewer],
  );

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, []);

  const others = useMemo(() => {
    if (!presence || !viewer || now === 0) return [];
    const cutoff = now - PRESENCE_TTL_MS;
    return presence.filter(
      (row) => row.visitorId !== viewer.id && row.lastSeenAt > cutoff,
    );
  }, [presence, viewer, now]);

  if (canvas === undefined) {
    return (
      <VStack style={pageStyle} hAlign="center" vAlign="center">
        <Spinner label="Loading canvas" size="lg" />
      </VStack>
    );
  }

  if (canvas === null) {
    return (
      <VStack style={pageStyle} hAlign="center" vAlign="center" gap={4}>
        <Text type="display-3">No canvas here</Text>
        <Text color="secondary">
          This link points at a canvas that does not exist, or was deleted.
        </Text>
        <Button label="All canvases" href="/" variant="secondary" />
      </VStack>
    );
  }

  const kindLabel = canvas.kind === 'html' ? 'HTML' : 'React';

  return (
    <VStack className="workspace-with-island" gap={0}>
      <IslandNav
        title={canvas.title}
        titleMeta={
          <Badge
            label={kindLabel}
            variant={canvas.kind === 'html' ? 'orange' : 'cyan'}
          />
        }
        endContent={
          <HStack gap={3} vAlign="center">
            {others.length > 0 && (
              <HStack gap={1.5} vAlign="center">
                <StatusDot
                  variant="success"
                  label={`${others.length} other ${
                    others.length === 1 ? 'view' : 'views'
                  } open`}
                />
                <Text type="supporting">
                  {others.length} other{' '}
                  {others.length === 1 ? 'view' : 'views'}
                </Text>
              </HStack>
            )}
            <Text type="supporting" hasTabularNumbers>
              {status === 'pending' ? 'saving' : `v${canvas.version}`}
            </Text>
            <MoreMenu
              label="Canvas options"
              variant="ghost"
              size="sm"
              placement="below"
              alignment="end"
              items={[
                {
                  id: 'toggle-source',
                  label: split.isCollapsed ? 'Show source' : 'Hide source',
                  onClick: () =>
                    split.isCollapsed ? split.expand() : split.collapse(),
                },
                {
                  id: 'copy-link',
                  label: copied ? 'Link copied' : 'Copy link',
                  onClick: () => {
                    void handleCopyLink();
                  },
                },
              ]}
            />
          </HStack>
        }
      />
      <Layout
        className="workspace-body"
        style={workspaceBodyStyle}
        height="fill"
        start={
          split.isCollapsed ? undefined : (
            <>
              <LayoutPanel
                width={split.size}
                padding={0}
                isScrollable={false}
                label="Source"
              >
                <Layout
                  height="fill"
                  header={
                    <LayoutHeader hasDivider>
                      <HStack gap={3} vAlign="center" hAlign="between">
                        <Text type="label">Source</Text>
                        <Text type="supporting">
                          {canvas.kind === 'html' ? 'HTML' : 'React'}
                        </Text>
                      </HStack>
                    </LayoutHeader>
                  }
                  content={
                    <LayoutContent padding={0} isScrollable={false}>
                      <textarea
                        style={editorStyle}
                        value={draft ?? ''}
                        onChange={(event) => handleChange(event.target.value)}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        aria-label="Canvas source"
                      />
                    </LayoutContent>
                  }
                />
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                resizable={split.props}
                label="Resize source pane"
              />
            </>
          )
        }
        content={
          <LayoutContent padding={0} isScrollable={false} label="Preview">
            <Layout
              height="fill"
              style={fillStyle}
              header={
                split.isCollapsed ? undefined : (
                  <LayoutHeader hasDivider>
                    <HStack gap={3} vAlign="center" hAlign="between">
                      <Text type="label">Preview</Text>
                    </HStack>
                  </LayoutHeader>
                )
              }
              content={
                <LayoutContent padding={0} isScrollable={false}>
                  <iframe
                    style={frameStyle}
                    title={`${canvas.title} preview`}
                    sandbox="allow-scripts allow-modals allow-forms allow-popups"
                    srcDoc={buildPreviewDocument(
                      canvas.kind,
                      previewSource ?? '',
                    )}
                  />
                </LayoutContent>
              }
            />
          </LayoutContent>
        }
      />
    </VStack>
  );
}
