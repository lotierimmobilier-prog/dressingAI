/**
 * Donut chart SVG pur (aucune dépendance) — répartition des couleurs
 * dominantes de la garde-robe.
 */
export default function DonutChart({ data, size = 180, thickness = 26 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const radius = (size - thickness) / 2
  const circ = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ffffff10" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * circ
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += len
          return seg
        })}
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-cream/90">{d.label}</span>
            <span className="label-mono ml-auto">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
