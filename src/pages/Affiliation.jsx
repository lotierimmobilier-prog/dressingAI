import { useState } from 'react'
import { ArrowLeft, Check, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import { getAffiliateConfig, saveAffiliateConfig } from '../lib/affiliateConfig'
import { haptic } from '../hooks/useGameification'

// Boutiques en affiliation directe (paramètre de suivi collé depuis leur programme).
const DIRECT_SHOPS = [
  { key: 'shein', label: 'Shein', color: '#111111', example: 'ton lien Shein, ou ref=6NU4K' },
  { key: 'zalando', label: 'Zalando', color: '#FF6900', example: 'ton lien Zalando, ou wmc=abcde' },
  { key: 'asos', label: 'ASOS', color: '#2D2D2D', example: 'ton lien ASOS, ou affid=12345' },
]

export default function Affiliation() {
  const navigate = useNavigate()
  const [cfg, setCfg] = useState(getAffiliateConfig)
  const [saved, setSaved] = useState(false)

  function update(patch) {
    setCfg((c) => ({ ...c, ...patch }))
    setSaved(false)
  }
  function save() {
    saveAffiliateConfig(cfg)
    setSaved(true)
    haptic([10, 20])
  }

  // Statut en direct (reflète la saisie en cours, même non enregistrée).
  const status = [
    { label: 'Amazon', color: '#FF9900', on: Boolean(cfg.amazonTag) },
    ...DIRECT_SHOPS.map((s) => ({ label: s.label, color: s.color, on: Boolean(cfg[s.key]) })),
  ]

  return (
    <PageTransition className="px-4 pt-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted">
        <ArrowLeft size={16} /> Retour
      </button>
      <h1 className="mb-1 font-display text-3xl">Monétisation 💸</h1>
      <p className="mb-6 text-muted">
        Affiliation <b className="text-cream">directe</b> avec chaque boutique (aucun intermédiaire
        payant). Colle l’identifiant que ton programme d’affiliation te fournit : les liens
        deviennent traqués et te rapportent une commission, sans surcoût pour l’acheteur.
      </p>

      {/* Amazon */}
      <section className="card mb-4 p-5">
        <h2 className="mb-1 flex items-center gap-2 font-display">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#FF9900' }} /> Amazon
        </h2>
        <p className="mb-3 text-sm text-muted">
          Ton tag Amazon Partenaires (ex. <code className="text-cream">dressingai-21</code>).
        </p>
        <input
          className="input"
          placeholder="ton-tag-21"
          value={cfg.amazonTag}
          onChange={(e) => update({ amazonTag: e.target.value.trim() })}
        />
      </section>

      {/* Boutiques en direct */}
      <section className="card mb-4 p-5">
        <h2 className="mb-1 font-display">Boutiques en direct</h2>
        <p className="mb-4 text-sm text-muted">
          Inscris-toi au programme d’affiliation de chaque boutique, puis colle ici soit ton{' '}
          <b className="text-cream">lien d’affiliation complet</b> (l’app en extrait le suivi
          automatiquement), soit le <b className="text-cream">paramètre</b> seul au format{' '}
          <code className="text-cream">clé=valeur</code>.
        </p>
        <div className="grid gap-3">
          {DIRECT_SHOPS.map((s) => (
            <div key={s.key}>
              <label className="label-mono flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} /> {s.label}
              </label>
              <input
                className="input mt-1"
                placeholder={s.example}
                value={cfg[s.key]}
                onChange={(e) => update({ [s.key]: e.target.value.trim() })}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Statut par boutique */}
      <section className="card mb-4 p-5">
        <h2 className="mb-3 font-display">Boutiques qui te rapportent</h2>
        <div className="space-y-2">
          {status.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-cream/90">{s.label}</span>
              <span className={`label-mono ml-auto ${s.on ? 'text-mint' : ''}`}>
                {s.on ? 'affilié ✓' : 'inactif'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <button onClick={save} className="btn-primary mb-4 w-full">
        {saved ? (
          <>
            <Check size={18} /> Enregistré
          </>
        ) : (
          'Enregistrer'
        )}
      </button>

      <div className="flex items-start gap-2 rounded-2xl bg-white/[0.03] p-3 text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>
          Ces réglages sont enregistrés sur cet appareil. Pour que les commissions comptent pour{' '}
          <b className="text-cream">tous les visiteurs</b>, renseigne aussi ces mêmes valeurs dans
          le fichier <code className="text-cream">.env</code> du serveur (puis rebuild).
        </p>
      </div>
    </PageTransition>
  )
}
