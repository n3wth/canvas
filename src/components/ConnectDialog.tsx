'use client';

import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  VStack,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';

type ConnectDialogProps = {
  slug: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/**
 * Quiet connect sheet for agents (David / Hermes) and humans.
 * Letter-page voice: this URL, how to make another, how collab works.
 */
export function ConnectDialog({slug, isOpen, onOpenChange}: ConnectDialogProps) {
  const shareUrl = `https://canvas.n3wth.com/c/${slug}`;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="info"
      width={520}
    >
      <Layout
        header={
          <DialogHeader
            title="Connect"
            subtitle="Agents and humans, same URL."
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent padding={5}>
            <VStack gap={5}>
              <VStack gap={2}>
                <Text weight="semibold">This canvas</Text>
                <Text color="secondary">
                  Share this URL. An agent attaches with the HTTP API and the
                  in-repo skill at{' '}
                  <Text as="span" weight="medium">
                    skills/canvas/SKILL.md
                  </Text>
                  . When{' '}
                  <Text as="span" weight="medium">
                    CANVAS_AGENT_TOKEN
                  </Text>{' '}
                  is set, send it as a Bearer token. PUT source to cowork on
                  this slug; GET to read.
                </Text>
                <TextInput
                  label="Share URL"
                  value={shareUrl}
                  isReadOnly
                  width="100%"
                />
              </VStack>

              <VStack gap={2}>
                <Text weight="semibold">Make a new one</Text>
                <Text color="secondary">
                  POST create defaults to interactive markdown. The agent
                  returns the running URL. Creating on the homepage is markdown
                  too.
                </Text>
              </VStack>

              <VStack gap={2}>
                <Text weight="semibold">Collab</Text>
                <Text color="secondary">
                  Share the URL. Open views follow writes. David, Hermes, and
                  humans use the same link. Contact{' '}
                  <Text as="span" weight="medium">
                    hey@n3wth.com
                  </Text>
                  .
                </Text>
              </VStack>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <Button
              label="Done"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            />
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
