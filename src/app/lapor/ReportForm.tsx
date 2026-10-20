'use client';
import { useState } from 'react';
import { compressImage } from '@/reports/compress';
import { createClient } from '@/lib/supabase/browser';
import { HAZARD_LABEL } from '@/lib/status';
import { HAZARDS, type Hazard } from '@/risk/types';

const intOrNull = (v: FormDataEntryValue | null) => (v === null || v === '' ? null : Math.max(0, Math.round(Number(v))));

export function ReportForm({ schoolId, reporterId }: { schoolId: string; reporterId: string }) {
  const [hazard, setHazard] = useState<Hazard>('asap');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setMsg(null);
    const db = createClient();
    let photo_path: string | null = null;
    let photoNote = '';
    const file = f.get('photo');
    if (file instanceof File && file.size > 0) {
      try {
        const blob = await compressImage(file);
        const path = `${schoolId}/${crypto.randomUUID()}.jpg`;
        const { error } = await db.storage.from('reports').upload(path, blob, { contentType: 'image/jpeg' });
        if (error) throw new Error('Unggah foto gagal');
        photo_path = path;
      } catch (err) {
        photoNote = ` Foto tidak ikut terkirim: ${err instanceof Error ? err.message : 'unggah gagal'}.`;
      }
    }
    const { error } = await db.from('field_reports').insert({
      school_id: schoolId,
      reporter_id: reporterId,
      hazard,
      visibility_m: hazard === 'asap' ? intOrNull(f.get('visibility_m')) : null,
      smoke_smell: hazard === 'asap' ? f.get('smoke_smell') === 'on' : null,
      water_depth_cm: hazard === 'banjir' ? intOrNull(f.get('water_depth_cm')) : null,
      wind_felt: hazard === 'angin' ? ((f.get('wind_felt') as string) || 'tidak') : null,
      students_sick: intOrNull(f.get('students_sick')) ?? 0,
      note: String(f.get('note') ?? '').slice(0, 1000) || null,
      photo_path,
    });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: `Laporan belum terkirim: ${error.message}. Coba lagi.` });
      return;
    }
    form.reset();
    setMsg({ ok: true, text: `Laporan terkirim ke dinas.${photoNote}` });
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <fieldset className="field">
        <legend>Bencana</legend>
        <div className="choice">
          {HAZARDS.map((h) => (
            <button key={h} type="button" aria-pressed={hazard === h} onClick={() => setHazard(h)}>{HAZARD_LABEL[h]}</button>
          ))}
        </div>
      </fieldset>

      {hazard === 'asap' && (
        <>
          <div className="field">
            <label htmlFor="visibility_m">Jarak pandang (meter)</label>
            <input id="visibility_m" name="visibility_m" type="number" min={0} max={20000} inputMode="numeric" placeholder="mis. 300" />
          </div>
          <label className="row" style={{ alignItems: 'center' }}>
            <input type="checkbox" name="smoke_smell" /> Tercium bau asap
          </label>
        </>
      )}
      {hazard === 'banjir' && (
        <div className="field">
          <label htmlFor="water_depth_cm">Tinggi genangan di sekolah (cm)</label>
          <input id="water_depth_cm" name="water_depth_cm" type="number" min={0} max={500} inputMode="numeric" placeholder="mis. 20" />
        </div>
      )}
      {hazard === 'angin' && (
        <fieldset className="field">
          <legend>Angin yang terasa</legend>
          <div className="choice">
            <label><input type="radio" name="wind_felt" value="tidak" defaultChecked /> Biasa</label>
            <label><input type="radio" name="wind_felt" value="kencang" /> Kencang</label>
            <label><input type="radio" name="wind_felt" value="merusak" /> Merusak</label>
          </div>
        </fieldset>
      )}

      <div className="field">
        <label htmlFor="students_sick">Siswa sakit atau terdampak hari ini</label>
        <input id="students_sick" name="students_sick" type="number" min={0} max={5000} inputMode="numeric" defaultValue={0} />
      </div>
      <div className="field">
        <label htmlFor="note">Catatan</label>
        <textarea id="note" name="note" rows={3} maxLength={1000} />
      </div>
      <div className="field">
        <label htmlFor="photo">Foto (opsional)</label>
        <input id="photo" name="photo" type="file" accept="image/*" capture="environment" />
      </div>
      {msg && <p className={msg.ok ? '' : 'error'} role="status">{msg.text}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim laporan'}</button>
    </form>
  );
}
