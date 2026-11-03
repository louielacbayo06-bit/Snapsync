import { Suspense, use } from 'react';
import { PhotoBooth } from '../../../components/photo-booth';

function RoomContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return <PhotoBooth mode="duo" room={code} />;
}

export default function RoomPage({ params }: PageProps<'/room/[code]'>) {
  return (
    <Suspense fallback={<main aria-live="polite">Joining your SnapSync room…</main>}>
      <RoomContent params={params} />
    </Suspense>
  );
}
