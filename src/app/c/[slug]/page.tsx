import type {Metadata} from 'next';
import {CanvasWorkspace} from '@/components/CanvasWorkspace';

type Params = {slug: string};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const {slug} = await params;
  return {
    title: `canvas / ${slug}`,
  };
}

export default async function CanvasPage({params}: {params: Promise<Params>}) {
  const {slug} = await params;
  return <CanvasWorkspace slug={slug} />;
}
