import { Bone, TopbarShell } from '@/components/Skeleton';

export default function Loading() {
  return (
    <>
      <TopbarShell />
      <main className="wrap stack" role="status">
        <Bone h={40} w="60%" />
        <Bone h={20} w="40%" />
        <Bone h={64} />
        <Bone h={64} />
        <Bone h={64} />
        <span className="sr-only">Memuat…</span>
      </main>
    </>
  );
}
