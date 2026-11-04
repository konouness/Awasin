import { Bone, TopbarShell } from '@/components/Skeleton';

export default function Loading() {
  return (
    <>
      <TopbarShell />
      <main className="wrap stack" style={{ maxWidth: 1100 }}>
        <Bone h={40} w="50%" />
        {Array.from({ length: 10 }, (_, i) => <Bone key={i} h={44} />)}
        <span className="sr-only" role="status">Memuat…</span>
      </main>
    </>
  );
}
