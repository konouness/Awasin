import csv
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

root = Path(__file__).resolve().parent.parent / "docs" / "backtest"
rows = list(csv.DictReader(open(root / "backtest.csv")))
days = [str(int(r["day"][8:])) + " Agu" for r in rows]
x = range(len(rows))
series = [
    ("n_normal", "Masuk normal", "#2e7d32"),
    ("n_kurangi_luar", "Kurangi kegiatan luar", "#f9a825"),
    ("n_tunda_masuk", "Tunda jam masuk", "#ef6c00"),
    ("n_pulang_awal", "Pulang lebih awal", "#8d6e63"),
    ("n_daring", "Belajar daring", "#c62828"),
]

fig, ax = plt.subplots(figsize=(16, 9), dpi=100)
bottom = [0] * len(rows)
for key, label, color in series:
    vals = [int(r[key]) for r in rows]
    ax.bar(x, vals, bottom=bottom, color=color, label=label, width=0.8)
    bottom = [b + v for b, v in zip(bottom, vals)]
ax.set_ylim(0, len(rows) and sum(int(rows[0][k]) for k, _, _ in series) * 1.35)
ax.set_ylabel("Jumlah sekolah (rekomendasi Awasin pukul 06.00 WIB)", fontsize=13)
ax.set_xticks(list(x))
ax.set_xticklabels(days, rotation=90, fontsize=10)

ax2 = ax.twinx()
ax2.plot(x, [float(r["pm25_max_06wib"]) for r in rows], color="#212121", linewidth=2.5, marker="o", label="PM2.5 tertinggi 06.00 WIB")
ax2.set_ylabel("PM2.5 (µg/m³)", fontsize=13)
ax2.set_ylim(bottom=0)

args = sys.argv[1:]
for i in range(0, len(args) - 1, 2):
    day, label = args[i], args[i + 1]
    idx = next(j for j, r in enumerate(rows) if r["day"] == day)
    ax.axvline(idx, color="#1565c0", linestyle="--", linewidth=2)
    ax.text(idx, ax.get_ylim()[1] * 0.98, " " + label, color="#1565c0", fontsize=12, va="top", ha="right" if idx > len(rows) / 2 else "left", rotation=90)

h1, l1 = ax.get_legend_handles_labels()
h2, l2 = ax2.get_legend_handles_labels()
ax.legend(h1 + h2, l1 + l2, loc="upper left", fontsize=11)
ax.set_title("Awasin vs. kejadian nyata, Kalteng Agustus 2026", fontsize=18, weight="bold")
fig.tight_layout()
out = root / "backtest.png"
fig.savefig(out)
print(out, round(out.stat().st_size / 1024), "KB")
