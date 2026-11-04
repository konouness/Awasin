import { Bone } from '@/components/Skeleton';

export default function Loading() {
  return (
    <main className="wrap stack" style={{ maxWidth: 520 }}>
      <Bone h={40} w="70%" />
      <Bone h={20} w="40%" />
      <Bone h={44} />
      <Bone h={44} />
      <div className="row" aria-hidden="true">
        <Bone h={56} w="calc(50% - 5px)" />
        <Bone h={56} w="calc(50% - 5px)" />
      </div>
      <Bone h={44} />
      <span className="sr-only" role="status">Memuat…</span>
    </main>
  );
}
