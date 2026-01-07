import { useEffect, useState } from "react";

const PAIRS = {
  usd: { label: "🇺🇸 USD/BRL", file: "/data/usdbrl.json" },
  eur: { label: "🇪🇺 EUR/BRL", file: "/data/eurbrl.json" },
};

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function percentChange(current: number, previous: number | null) {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

interface HistoryPoint {
  bid: number;
  timestamp_iso: string;
  source?: string;
}

export default function Dashboard() {
  const [pair, setPair] = useState<"usd" | "eur">("usd");
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(PAIRS[pair].file, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar dados");
        return res.json();
      })
      .then((data) => setHistory(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [pair]);

  const last = history[history.length - 1];
  const prev = history.length >= 2 ? history[history.length - 2] : null;
  const lastBid = last ? last.bid : null;
  const prevBid = prev ? prev.bid : null;
  const chg = lastBid && prevBid ? percentChange(lastBid, prevBid) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl w-full p-4">
      <h1 className="text-2xl font-bold mb-2">FX Piggybank</h1>
      <div className="text-gray-500 text-sm mb-4">
        Histórico versionado em <code className="bg-gray-100 px-1 rounded">/data/*.json</code> • Atualizado automaticamente 2x/dia
      </div>
      <div className="inline-flex border rounded-lg overflow-hidden mb-6">
        {Object.entries(PAIRS).map(([k, v]) => (
          <button
            key={k}
            className={`px-4 py-2 text-sm font-medium focus:outline-none transition-colors ${pair === k ? "bg-gray-900 text-white" : "bg-white text-gray-900 hover:bg-gray-100"}`}
            onClick={() => setPair(k as "usd" | "eur")}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl p-4">
          <div className="text-gray-500 text-xs">Última cotação (bid)</div>
          <div className="text-2xl font-bold">{lastBid !== null ? fmtBRL(lastBid) : "—"}</div>
          <div className="text-gray-400 text-xs">{last ? `UTC: ${last.timestamp_iso}` : "—"}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-gray-500 text-xs">Variação vs anterior</div>
          <div className="text-2xl font-bold">{chg !== null ? fmtPct(chg) : "—"}</div>
          <div className="text-gray-400 text-xs">{prev ? `Anterior UTC: ${prev.timestamp_iso}` : "Sem ponto anterior"}</div>
        </div>
        <div className="border rounded-xl p-4">
          <div className="text-gray-500 text-xs">Fonte</div>
          <div className="text-2xl font-bold">{last?.source || "—"}</div>
          <div className="text-gray-400 text-xs">PTAX aparece quando cai em fallback.</div>
        </div>
      </div>
      <div className="mb-2 text-gray-500 text-xs">Últimos pontos</div>
      <LineChart points={history.slice(-60)} />
      <div className="text-gray-400 text-xs mt-2">
        {PAIRS[pair].label} • mostrando {Math.min(60, history.length)} pontos
      </div>
      <div className="mt-6 text-gray-400 text-xs">
        Repo: <a href="https://github.com/momoantunes/FX-Piggybank" target="_blank" rel="noreferrer" className="underline">abrir no GitHub</a>
      </div>
      {loading && <div className="text-blue-500 mt-2">Carregando...</div>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  </div>
  );
}

function LineChart({ points }: { points: HistoryPoint[] }) {
  // TODO: Implementar SVG chart estilizado com Tailwind
  if (points.length < 2) {
    return <div className="h-40 flex items-center justify-center text-gray-400">Sem dados suficientes.</div>;
  }
  const ys = points.map((p) => p.bid);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const isFlat = ys.every((v) => v === ys[0]);
  const W = 980, H = 320, pad = 30;
  const rangeY = maxY - minY || 1;
  const xTo = (i: number) => pad + (i / (ys.length - 1)) * (W - pad * 2);
  const yTo = (v: number) => (H - pad) - ((v - minY) / rangeY) * (H - pad * 2);
  let path = `M ${xTo(0)},${yTo(ys[0])}`;
  for (let i = 1; i < ys.length; i++) path += ` L ${xTo(i)},${yTo(ys[i])}`;
  return (
    <svg width={W} height={H} className="w-full max-w-4xl h-80 bg-white rounded-xl border">
      <path d={path} fill="none" stroke="#6366f1" strokeWidth={2} />
      {/* Eixos */}
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#e5e7eb" />
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e5e7eb" />
      {/* Min/Max labels */}
      <text x={pad} y={pad - 10} fontSize={12} fill="#6b7280">min {minY.toFixed(4)}</text>
      <text x={pad + 120} y={pad - 10} fontSize={12} fill="#6b7280">max {maxY.toFixed(4)}</text>
      {isFlat && <text x={pad + 10} y={pad + 20} fontSize={12} fill="#6b7280">Sem variação no período</text>}
    </svg>
  );
}
