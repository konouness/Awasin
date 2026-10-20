'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

const SYMPTOMS = [['batuk', 'Batuk'], ['sesak', 'Sesak napas'], ['demam', 'Demam'], ['mata_perih', 'Mata perih']] as const;

export function CheckinForm({ npsn }: { npsn: string }) {
  const [status, setStatus] = useState<'sehat' | 'sakit'>('sehat');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg(null);
    const { data, error } = await createClient().rpc('submit_checkin', {
      p_npsn: npsn,
      p_name: String(f.get('name') ?? ''),
      p_class: String(f.get('class') ?? ''),
      p_status: status,
      p_symptoms: status === 'sakit' ? f.getAll('symptoms').map(String) : [],
    });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }
    const d = new Date(`${data}T00:00:00Z`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    setMsg({ ok: true, text: `Terima kasih, absen ${d} tercatat. Kirim lagi kalau ada perubahan, data hari ini akan diganti.` });
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="field">
        <label htmlFor="name">Nama siswa</label>
        <input id="name" name="name" type="text" required maxLength={60} autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="class">Kelas</label>
        <input id="class" name="class" type="text" required maxLength={60} placeholder="mis. 4A" />
      </div>
      <fieldset className="field">
        <legend>Kondisi hari ini</legend>
        <div className="choice">
          <button type="button" aria-pressed={status === 'sehat'} onClick={() => setStatus('sehat')}>Sehat</button>
          <button type="button" aria-pressed={status === 'sakit'} onClick={() => setStatus('sakit')}>Sakit</button>
        </div>
      </fieldset>
      {status === 'sakit' && (
        <fieldset className="field">
          <legend>Gejala</legend>
          <div className="choice">
            {SYMPTOMS.map(([v, l]) => (
              <label key={v}><input type="checkbox" name="symptoms" value={v} /> {l}</label>
            ))}
          </div>
        </fieldset>
      )}
      {msg && <p className={msg.ok ? '' : 'error'} role="status">{msg.text}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim absen'}</button>
    </form>
  );
}
