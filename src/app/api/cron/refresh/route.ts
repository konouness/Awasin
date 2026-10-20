import { realDeps } from '@/pipeline/deps';
import { refresh } from '@/pipeline/refresh';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const now = new Date();
  const res = await refresh(realDeps(now, async () => {}), now);
  return Response.json(res, { status: res.ok ? 200 : 502 });
}
