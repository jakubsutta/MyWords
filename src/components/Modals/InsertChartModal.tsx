import React, { useState, useEffect } from 'react';
import {
  X,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertChart: (svgDataUrl: string, title: string) => void;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose/red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

export const InsertChartModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertChart,
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('Přehled prodejů za Q1');
  const [dataPoints, setDataPoints] = useState<ChartDataPoint[]>([
    { label: 'Leden', value: 45, color: '#3b82f6' },
    { label: 'Únor', value: 72, color: '#10b981' },
    { label: 'Březen', value: 58, color: '#f59e0b' },
    { label: 'Duben', value: 90, color: '#8b5cf6' },
  ]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddPoint = () => {
    const nextIdx = dataPoints.length;
    setDataPoints([
      ...dataPoints,
      {
        label: `Položka ${nextIdx + 1}`,
        value: Math.floor(Math.random() * 50) + 20,
        color: DEFAULT_COLORS[nextIdx % DEFAULT_COLORS.length],
      },
    ]);
  };

  const handleRemovePoint = (index: number) => {
    if (dataPoints.length <= 1) return;
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  };

  const handleUpdatePoint = (
    index: number,
    field: keyof ChartDataPoint,
    val: string | number
  ) => {
    const updated = [...dataPoints];
    updated[index] = { ...updated[index], [field]: val };
    setDataPoints(updated);
  };

  // Generate SVG string
  const generateSvg = (): string => {
    const width = 600;
    const height = 360;
    const padding = { top: 60, right: 40, bottom: 60, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = dataPoints.map((d) => Number(d.value) || 0);
    const maxVal = Math.max(...values, 10);
    const totalVal = values.reduce((a, b) => a + b, 0) || 1;

    let chartContent = '';

    if (chartType === 'bar') {
      const barWidth = Math.min(60, (chartW / dataPoints.length) * 0.65);
      const gap = (chartW - barWidth * dataPoints.length) / (dataPoints.length + 1);

      // Y-axis gridlines
      const gridSteps = 4;
      let gridLines = '';
      for (let i = 0; i <= gridSteps; i++) {
        const y = padding.top + chartH - (i / gridSteps) * chartH;
        const val = Math.round((i / gridSteps) * maxVal);
        gridLines += `
          <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="4,4" stroke-width="1" />
          <text x="${padding.left - 10}" y="${y + 4}" font-size="11" fill="#64748b" text-anchor="end" font-family="system-ui, -apple-system, sans-serif">${val}</text>
        `;
      }

      const bars = dataPoints
        .map((d, i) => {
          const val = Number(d.value) || 0;
          const barH = (val / maxVal) * chartH;
          const x = padding.left + gap + i * (barWidth + gap);
          const y = padding.top + chartH - barH;
          const color = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

          return `
            <g>
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${color}" />
              <text x="${x + barWidth / 2}" y="${y - 8}" font-size="11" font-weight="600" fill="#334155" text-anchor="middle" font-family="system-ui, sans-serif">${val}</text>
              <text x="${x + barWidth / 2}" y="${height - padding.bottom + 22}" font-size="11" fill="#475569" text-anchor="middle" font-family="system-ui, sans-serif">${d.label}</text>
            </g>
          `;
        })
        .join('');

      chartContent = gridLines + bars;
    } else if (chartType === 'line') {
      const stepX = dataPoints.length > 1 ? chartW / (dataPoints.length - 1) : chartW / 2;
      const points = dataPoints.map((d, i) => {
        const val = Number(d.value) || 0;
        const x = dataPoints.length > 1 ? padding.left + i * stepX : padding.left + chartW / 2;
        const y = padding.top + chartH - (val / maxVal) * chartH;
        return { x, y, val, label: d.label, color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] };
      });

      // Gridlines
      const gridSteps = 4;
      let gridLines = '';
      for (let i = 0; i <= gridSteps; i++) {
        const y = padding.top + chartH - (i / gridSteps) * chartH;
        const val = Math.round((i / gridSteps) * maxVal);
        gridLines += `
          <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="4,4" stroke-width="1" />
          <text x="${padding.left - 10}" y="${y + 4}" font-size="11" fill="#64748b" text-anchor="end" font-family="system-ui, sans-serif">${val}</text>
        `;
      }

      const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
      const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

      const lines = `
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#lineGrad)" />
        <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      `;

      const dots = points
        .map(
          (p) => `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="5" fill="#ffffff" stroke="#2563eb" stroke-width="3" />
            <text x="${p.x}" y="${p.y - 12}" font-size="11" font-weight="600" fill="#1e293b" text-anchor="middle" font-family="system-ui, sans-serif">${p.val}</text>
            <text x="${p.x}" y="${height - padding.bottom + 22}" font-size="11" fill="#475569" text-anchor="middle" font-family="system-ui, sans-serif">${p.label}</text>
          </g>
        `
        )
        .join('');

      chartContent = gridLines + lines + dots;
    } else if (chartType === 'pie' || chartType === 'doughnut') {
      const centerX = width / 2 - 80;
      const centerY = height / 2 + 10;
      const radius = 95;
      const innerRadius = chartType === 'doughnut' ? 50 : 0;

      let currentAngle = 0;
      let slices = '';
      let legend = '';

      dataPoints.forEach((d, i) => {
        const val = Number(d.value) || 0;
        const sliceAngle = (val / totalVal) * 2 * Math.PI;
        const color = d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

        const x1 = centerX + radius * Math.cos(currentAngle);
        const y1 = centerY + radius * Math.sin(currentAngle);
        const x2 = centerX + radius * Math.cos(currentAngle + sliceAngle);
        const y2 = centerY + radius * Math.sin(currentAngle + sliceAngle);

        const x3 = centerX + innerRadius * Math.cos(currentAngle + sliceAngle);
        const y3 = centerY + innerRadius * Math.sin(currentAngle + sliceAngle);
        const x4 = centerX + innerRadius * Math.cos(currentAngle);
        const y4 = centerY + innerRadius * Math.sin(currentAngle);

        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        let pathData = '';
        if (innerRadius === 0) {
          pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        } else {
          pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
        }

        slices += `<path d="${pathData}" fill="${color}" stroke="#ffffff" stroke-width="2" />`;

        // Legend item on the right
        const legendY = 90 + i * 26;
        const pct = Math.round((val / totalVal) * 100);
        legend += `
          <g>
            <rect x="${width - 190}" y="${legendY}" width="14" height="14" rx="3" fill="${color}" />
            <text x="${width - 165}" y="${legendY + 11}" font-size="11" fill="#334155" font-family="system-ui, sans-serif">
              ${d.label} <tspan font-weight="bold">(${pct}%)</tspan>
            </text>
          </g>
        `;

        currentAngle += sliceAngle;
      });

      chartContent = slices + legend;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #ffffff; border-radius: 12px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Card Background -->
        <rect width="${width}" height="${height}" fill="#ffffff" rx="12" stroke="#e2e8f0" stroke-width="1"/>
        
        <!-- Title -->
        <text x="${width / 2}" y="36" font-size="16" font-weight="700" fill="#0f172a" text-anchor="middle">
          ${title || 'Graf'}
        </text>

        <!-- Content -->
        ${chartContent}
      </svg>
    `.trim();
  };

  const handleInsert = () => {
    const svg = generateSvg();
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    onInsertChart(dataUrl, title || 'Graf');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Vložit graf
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Zavřít (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Chart Type & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Typ grafu
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md text-[11px] font-medium transition-all ${
                    chartType === 'bar'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Sloupcový graf"
                >
                  <BarChart3 className="w-4 h-4 mb-0.5" />
                  Sloupce
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md text-[11px] font-medium transition-all ${
                    chartType === 'line'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Čárový graf"
                >
                  <LineChartIcon className="w-4 h-4 mb-0.5" />
                  Čárový
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md text-[11px] font-medium transition-all ${
                    chartType === 'pie'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Výsečový koláč"
                >
                  <PieChartIcon className="w-4 h-4 mb-0.5" />
                  Koláč
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('doughnut')}
                  className={`flex flex-col items-center justify-center py-2 rounded-md text-[11px] font-medium transition-all ${
                    chartType === 'doughnut'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Kruhový prstenec"
                >
                  <PieChartIcon className="w-4 h-4 mb-0.5" />
                  Kruh
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Název grafu
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Zadejte název grafu..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Živý náhled grafu
            </label>
            <div
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center shadow-inner overflow-hidden"
              dangerouslySetInnerHTML={{ __html: generateSvg() }}
            />
          </div>

          {/* Data Points Table */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Hodnoty grafu
              </label>
              <button
                type="button"
                onClick={handleAddPoint}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-1 rounded-md border border-blue-200/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Přidat položku
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {dataPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <input
                    type="color"
                    value={point.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                    onChange={(e) => handleUpdatePoint(idx, 'color', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                    title="Změnit barvu"
                  />
                  <input
                    type="text"
                    value={point.label}
                    onChange={(e) => handleUpdatePoint(idx, 'label', e.target.value)}
                    placeholder="Popisek..."
                    className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={point.value}
                    onChange={(e) => handleUpdatePoint(idx, 'value', Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(idx)}
                    disabled={dataPoints.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                    title="Odstranit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Vložit do dokumentu
          </button>
        </div>
      </div>
    </div>
  );
};
