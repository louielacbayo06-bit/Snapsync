import { PhotoBooth } from '../../components/photo-booth';
import { Suspense } from 'react';

export const metadata = {
  title: 'Photo booth | SnapSync',
};

async function BoothContent({ searchParams }: { searchParams: Promise<{ mode?: string; room?: string }> }) {
  const { mode, room } = await searchParams;
  return <PhotoBooth mode={mode} room={room} />;
}

export default function BoothPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; room?: string }>;
}) {
  return (
    <Suspense fallback={<main aria-busy="true" className="min-h-screen bg-[#0b091b] p-10 text-white">Loading your booth…</main>}>
      <BoothContent searchParams={searchParams} />
    </Suspense>
  );
}
