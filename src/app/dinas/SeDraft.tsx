'use client';
import { useState, useTransition } from 'react';
import { draftSE } from './actions';

export function SeDraft({ kabupaten }: { kabupaten: string[] }) {
  const [kab, setKab] = useState(kabupaten[0] ?? '');
  const [text, setText] = useState('');
  const [pending, start] = useTransition();
  return (
    <section className="stack" aria-label="Draf surat edaran">
      <h2>Draf surat edaran</h2>
      <div className="row" style={{ alignItems: 'end' }}>
        <div className="field">
          <label htmlFor="se-kab">Kabupaten/kota</label>
          <select id="se-kab" value={kab} onChange={(e) => setKab(e.target.value)}>
            {kabupaten.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <button className="btn" type="button" disabled={pending || !kab} onClick={() => start(async () => setText((await draftSE(kab)).text))}>
          Buat draf surat edaran
        </button>
      </div>
      <p className="small muted">Hanya angka total yang dikirim ke AI, tanpa nama siswa atau isi laporan.</p>
      {pending && <p className="muted" role="status">Menyusun draf…</p>}
      {text && !pending && (
        <div className="stack">
          <h3>Draf AI, periksa sebelum ditandatangani</h3>
          <textarea readOnly rows={14} value={text} aria-label="Draf surat edaran" />
        </div>
      )}
    </section>
  );
}
