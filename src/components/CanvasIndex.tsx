'use client';

import {useState, type CSSProperties} from 'react';
import {useRouter} from 'next/navigation';
import {useMutation, useQuery} from 'convex/react';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading} from '@astryxdesign/core/Heading';
import {
  HStack,
  Layout,
  LayoutContent,
  VStack,
} from '@astryxdesign/core/Layout';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Section} from '@astryxdesign/core/Section';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StackItem} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {TopNav, TopNavHeading} from '@astryxdesign/core/TopNav';
import {api} from '@/../convex/_generated/api';
import type {CanvasKind} from '@/lib/preview';

const pageStyle: CSSProperties = {height: '100dvh'};

export function CanvasIndex() {
  const router = useRouter();
  const canvases = useQuery(api.canvases.list);
  const create = useMutation(api.canvases.create);

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<CanvasKind>('html');
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    setIsCreating(true);
    try {
      const {slug} = await create({title, kind});
      router.push(`/c/${slug}`);
    } catch (error) {
      setIsCreating(false);
      throw error;
    }
  }

  return (
    <Layout
      style={pageStyle}
      height="fill"
      contentWidth={960}
      header={
        <TopNav
          label="Canvas"
          heading={<TopNavHeading heading="canvas" headingHref="/" />}
          endContent={
            <Button
              label="hey@n3wth.com"
              variant="ghost"
              size="sm"
              href="mailto:hey@n3wth.com"
            />
          }
        />
      }
      content={
        <LayoutContent padding={8}>
          <VStack gap={8}>
            <VStack gap={2} maxWidth={620}>
              <Heading level={1} type="display-2">
                Live canvases
              </Heading>
              <Text color="secondary">
                Write source on the left, watch it run on the right. The
                document lives in Convex, so the URL is the share button: open
                it twice and both views track the same canvas as it changes.
              </Text>
            </VStack>

            <VStack gap={3}>
              <Heading level={2}>New canvas</Heading>
              <Section variant="muted">
                <HStack gap={3} vAlign="end" wrap="wrap">
                  <StackItem size="fill">
                    <TextInput
                      label="Title"
                      placeholder="Untitled canvas"
                      width="100%"
                      value={title}
                      onChange={setTitle}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !isCreating) {
                          void handleCreate();
                        }
                      }}
                    />
                  </StackItem>
                  <SegmentedControl
                    label="Canvas kind"
                    value={kind}
                    onChange={(next) => setKind(next as CanvasKind)}
                  >
                    <SegmentedControlItem value="html" label="HTML" />
                    <SegmentedControlItem value="react" label="React" />
                  </SegmentedControl>
                  <Button
                    label="Create canvas"
                    variant="primary"
                    isLoading={isCreating}
                    onClick={handleCreate}
                  />
                </HStack>
              </Section>
            </VStack>

            <VStack gap={3}>
              <Heading level={2}>
                {canvases ? `Canvases (${canvases.length})` : 'Canvases'}
              </Heading>

              {canvases === undefined && (
                <VStack padding={8} hAlign="center">
                  <Spinner label="Loading canvases" />
                </VStack>
              )}

              {canvases?.length === 0 && (
                <EmptyState
                  title="No canvases yet"
                  description="Create one above. HTML gives you a whole document to own; React gives you a component compiled in the browser."
                />
              )}

              {canvases && canvases.length > 0 && (
                <Grid columns={{minWidth: 240, repeat: 'fit'}} gap={3}>
                  {canvases.map((canvas) => (
                    <ClickableCard
                      key={canvas._id}
                      label={`Open ${canvas.title}`}
                      href={`/c/${canvas.slug}`}
                    >
                      <VStack gap={3}>
                        <HStack gap={2} vAlign="center" hAlign="between">
                          <Text weight="medium" maxLines={1}>
                            {canvas.title}
                          </Text>
                          <Badge
                            label={canvas.kind === 'html' ? 'HTML' : 'React'}
                            variant={
                              canvas.kind === 'html' ? 'orange' : 'cyan'
                            }
                          />
                        </HStack>
                        <HStack gap={2} vAlign="center" hAlign="between">
                          <Timestamp
                            value={new Date(canvas.updatedAt).toISOString()}
                            format="relative_short"
                          />
                          <Text type="supporting" hasTabularNumbers>
                            v{canvas.version}
                          </Text>
                        </HStack>
                      </VStack>
                    </ClickableCard>
                  ))}
                </Grid>
              )}
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
