import { useState } from 'react'
import { ArrowLeft, Check, Link2, Info, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import { getAffiliateConfig, saveAffiliateConfig } from '../lib/affiliateConfig'
import { haptic } from '../hooks/useGameification'

const AWIN_SHOPS = [
  { key: 'shein', label: 'ID marchand Shein', color: '#111111' },
  { key: 'zalando', label: 'ID marchand Zalando', color: '#FF6900' },
  { key: 'asos', label: 'ID marchand ASOS', color: '#2D2D2D' },
]

export default function Affiliation() {
  const navigate = useNavigate()
  const [cfg, setCfg] = useState(getAffiliateConfig)
  const [saved, setSaved] = useState(false)

  function update(patch) {
    setCfg((c) => ({ ...c, ...patch }))
    setSaved(false)
  }
  function updateMid(patch) {
    setCfg((c) => ({ ...c, awinMid: { ...c.awinMid, ...patch } }))
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
    { label: 'Shein', color: '#111111', on: Boolean(cfg.awinId && cfg.awinMid.shein) },
    { label: 'Zalando', color: '#FF6900', on: Boolean(cfg.awinId && cfg.awinMid.zalando) },
    { label: 'ASOS', color: '#2D2D2D', on: Boolean(cfg.awinId && cfg.awinMid.asos) },
  ]

  return (
    <PageTransition className="px-4 pt-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted">
        <ArrowLeft size={16} /> Retour
      </button>
      <h1 className="mb-1 font-display text-3xl">Monétisation 💸</h1>
      <p className="mb-6 text-muted">
        Renseigne tes identifiants d’affiliation : les liens boutiques deviennent traqués et te
        rapportent une commission, sans surcoût pour l’acheteur.
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
        <a
          href="https://partenaires.amazon.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-accent"
        >
          Créer un compte Amazon Partenaires <ExternalLink size={12} />
        </a>
      </section>

      {/* Awin (Shein, Zalando, ASOS) */}
      <section className="card mb-4 p-5">
        <h2 className="mb-1 flex items-center gap-2 font-display">
          <Link2 size={18} className="text-accent" /> Awin
        </h2>
        <p className="mb-3 text-sm text-muted">
          Un seul compte Awin gère Shein, Zalando et ASOS. Renseigne ton ID éditeur, puis l’ID
          marchand de chaque boutique (visible dans ton dashboard Awin, une fois affilié·e).
        </p>
        <label className="label-mono">ID éditeur Awin</label>
        <input
          className="input mb-4 mt-1"
          placeholder="123456"
          value={cfg.awinId}
          onChange={(e) => update({ awinId: e.target.value.trim() })}
        />
        <div className="grid gap-3">
          {AWIN_SHOPS.map((m) => (
            <div key={m.key}>
              <label className="label-mono flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: m.color }} /> {m.label}
              </label>
              <input
                className="input mt-1"
                placeholder="ex. 16994"
                value={cfg.awinMid[m.key]}
                onChange={(e) => updateMid({ [m.key]: e.target.value.trim() })}
              />
            </div>
          ))}
        </div>
        <a
          href="https://www.awin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-accent"
        >
          Créer un compte Awin <ExternalLink size={12} />
        </a>
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
