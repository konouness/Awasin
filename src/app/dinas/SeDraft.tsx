'use client';
import { useState, useTransition } from 'react';
import { draftSE } from './actions';

export function SeDraft({ kabupaten }: { kabupaten: string[] }) {
  const [kab, setKab] = useState(kabupaten[0] ?? '');
  const [text, setText] = useState('');
  const [pending, start] = useTransition();
  return (
    <section className="stack panel" aria-label="Draf surat edaran">
      <h2>Draf surat edaran</h2>
      <div className="row" style={{ alignItems: 'end' }}>
        <div className="field">
          <label htmlFor="se-kab">Kabupaten/kota</label>
          <select id="se-kab" value={kab} onChange={(e) => setKab(e.target.value)}>
            {kabupaten.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <button className="btn" type="button" aria-busy={pending} disabled={pending || !kab} onClick={() => start(async () => setText((await draftSE(kab).catch(() => ({ text: 'Draf AI tidak tersedia, coba lagi nanti.' }))).text))}>
          Buat draf surat edaran
        </button>
      </div>
      <p className="small muted">Hanya jumlah sekolah per rekomendasi yang dikirim ke AI.</p>
      {pending && <p className="muted" role="status">Menyusun draf…</p>}
      {pending && (
        <div className="skel-letter" aria-hidden="true">
          {[100, 92, 96, 60, 88, 40].map((w, i) => <div key={i} className="skel-line" style={{ width: `${w}%` }} />)}
        </div>
      )}
      {text && !pending && (
        <div className="stack fade-in">
          <h3>Draf AI, periksa sebelum ditandatangani</h3>
          <textarea readOnly rows={14} value={text} aria-label="Draf surat edaran" />
        </div>
      )}
    </section>
  );
}
