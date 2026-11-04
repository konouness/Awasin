import { Bone, TopbarShell } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="map-page" role="status">
      <span className="sr-only">Memuat…</span>
      <TopbarShell />
      <div className="map-layout">
        <div className="map-box"><div className="skel map-skel" aria-hidden="true" /></div>
        <aside className="side stack">
          <div className="chips" aria-hidden="true">
            <Bone h={36} w={90} />
            <Bone h={36} w={110} />
            <Bone h={36} w={80} />
          </div>
          <Bone h={40} w="70%" />
          <div className="skel-tiles">
            <Bone h={64} />
            <Bone h={64} />
            <Bone h={64} />
            <Bone h={64} />
          </div>
          {Array.from({ length: 8 }, (_, i) => <Bone key={i} h={48} />)}
        </aside>
      </div>
    </div>
  );
}
