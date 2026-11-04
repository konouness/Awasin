import { Bone, TopbarShell } from '@/components/Skeleton';

export default function Loading() {
  return (
    <>
      <TopbarShell />
      <main className="wrap stack">
        <Bone h={40} w="70%" />
        <div className="chips" aria-hidden="true">
          <Bone h={44} w={90} />
          <Bone h={44} w={110} />
        </div>
        <Bone h={200} className="skel-sign" />
        {[0, 1, 2].map((i) => (
          <div className="hazard" key={i}>
            <Bone h={20} w="30%" />
            <Bone h={48} />
          </div>
        ))}
        <span className="sr-only" role="status">Memuat…</span>
      </main>
    </>
  );
}
