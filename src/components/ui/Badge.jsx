export default function Badge({ children, color, className = '' }) {
  return (
    <span
      className={`chip ${className}`}
      style={color ? { borderColor: `${color}66`, color } : undefined}
    >
      {children}
    </span>
  )
}
