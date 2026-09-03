'use client';

import {useState, type CSSProperties} from 'react';
import {useRouter} from 'next/navigation';
import {useMutation, useQuery} from 'convex/react';
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
import {Section} from '@astryxdesign/core/Section';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StackItem} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {api} from '@/../convex/_generated/api';
import {IslandNav} from '@/components/IslandNav';
import {ProductFooter} from '@/components/ProductFooter';

const fillStyle: CSSProperties = {flex: 1, minHeight: 0};

export function CanvasIndex() {
  const router = useRouter();
  const canvases = useQuery(api.canvases.list);
  const create = useMutation(api.canvases.create);

  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    setIsCreating(true);
    try {
      // Kind defaults to markdown on the server.
      const {slug} = await create({title});
      router.push(`/c/${slug}`);
    } catch (error) {
      setIsCreating(false);
      throw error;
    }
  }

  return (
    <VStack className="page-with-island home-page" gap={0}>
      <IslandNav />
      <Layout
        style={fillStyle}
        height="fill"
        contentWidth={720}
        content={
          <LayoutContent padding={8}>
            <main id="main">
              <VStack gap={8}>
                <VStack gap={3} maxWidth={520} className="home-hero">
                  <Heading level={1} type="display-2" className="home-display">
                    Canvas
                  </Heading>
                  <Text color="secondary" weight="medium">
                    Make a tool, share the URL.
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
                      description="Create one above."
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
                            <Text weight="medium" maxLines={1}>
                              {canvas.title}
                            </Text>
                            <Timestamp
                              value={new Date(canvas.updatedAt).toISOString()}
                              format="relative_short"
                            />
                          </VStack>
                        </ClickableCard>
                      ))}
                    </Grid>
                  )}
                </VStack>
              </VStack>
            </main>
          </LayoutContent>
        }
      />
      <ProductFooter />
    </VStack>
  );
}
