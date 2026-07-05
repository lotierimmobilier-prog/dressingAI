import { motion } from 'framer-motion'

/**
 * SIGNATURE VISUELLE — le "miroir de dressing".
 * Un reflet flou animé : dégradés qui tournent lentement (lumière douce
 * tournante) + halo pulsant. La teinte (`tint`) change selon l'humeur
 * sélectionnée sur la home.
 */
export default function MirrorBackground({ tint = '#8B7CF0', intensity = 1, children }) {
  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Couche miroir animée */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Halo tournant principal */}
        <motion.div
          key={tint}
          className="absolute left-1/2 top-[-10%] h-[80vh] w-[80vh] -translate-x-1/2 rounded-full blur-3xl animate-mirror-rotate"
          style={{
            background: `conic-gradient(from 0deg, ${tint}00, ${tint}88, ${tint}22, ${tint}66, ${tint}00)`,
            opacity: 0.5 * intensity,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 * intensity }}
          transition={{ duration: 1.2 }}
        />
        {/* Reflet secondaire bas */}
        <div
          className="absolute bottom-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full blur-3xl animate-mirror-pulse"
          style={{ background: `radial-gradient(circle, ${tint}55, transparent 70%)` }}
        />
        {/* Reflet froid opposé pour la profondeur */}
        <div
          className="absolute left-[-15%] top-[30%] h-[45vh] w-[45vh] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #7FA6C955, transparent 70%)' }}
        />
        {/* Voile verre dépoli + vignette */}
        <div className="absolute inset-0 backdrop-blur-2xl bg-bg/40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(13,13,13,0.85) 100%)',
          }}
        />
        {/* Fine ligne de reflet vertical, comme un miroir */}
        <div
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 opacity-[0.07]"
          style={{ background: 'linear-gradient(to bottom, transparent, #F5F5F0, transparent)' }}
        />
      </div>

      {children}
    </div>
  )
}
