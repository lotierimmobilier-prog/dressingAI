import { useEffect, useState } from 'react'
import { Loader2, Copy, Check, ExternalLink, Download, Sparkles, Tag, Share2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { generateVintedListing, isClaudeConfigured } from '../../lib/claude'
import { localListing, VINTED_SELL_URL } from '../../lib/vintedUrl'
import { haptic } from '../../hooks/useGameification'

/** Copie robuste, marche aussi hors contexte sécurisé (HTTP). */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fallback ci-dessous */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/**
 * Assistant de mise en vente Vinted :
 * l'IA rédige titre + description + prix conseillé, l'utilisateur copie et
 * ouvre Vinted (Vinted ne permet pas la publication automatique — voir README).
 */
export default function VintedSell({ item, open, onClose, onShared }) {
  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState(null)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (!open || !item) return
    let cancelled = false
    setLoading(true)
    setListing(null)
    ;(async () => {
      let res = null
      if (isClaudeConfigured) {
        try {
          res = await generateVintedListing(item)
        } catch {
          res = null
        }
      }
      if (!res) res = localListing(item)
      if (!cancelled) {
        setListing(res)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, item])

  const setField = (k, v) => setListing((l) => ({ ...l, [k]: v }))

  async function copy(field, text) {
    const ok = await copyText(text)
    if (ok) {
      haptic(10)
      setCopied(field)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  function openVinted() {
    haptic([10, 30])
    window.open(VINTED_SELL_URL, '_blank', 'noopener,noreferrer')
    onShared?.()
  }

  /**
   * Partage natif (Web Share API) : envoie la PHOTO en fichier vers le menu de
   * partage du téléphone → l'app Vinted y apparaît et ouvre une annonce avec la
   * photo déjà attachée. Le texte de l'annonce est copié pour le coller.
   * Nécessite un contexte sécurisé (HTTPS).
   */
  async function shareToVinted() {
    haptic([10, 30])
    await copyText(fullText) // le texte est prêt à coller
    try {
      const shareData = {
        title: listing.titre,
        text: `${listing.description}\n\nPrix : ${listing.prix_conseille} €`,
      }
      if (item?.photo_url) {
        const res = await fetch(item.photo_url)
        const blob = await res.blob()
        const file = new File(
          [blob],
          `${(item.nom || 'vetement').replace(/\s+/g, '-')}.jpg`,
          { type: blob.type || 'image/jpeg' },
        )
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file]
        }
      }
      await navigator.share(shareData)
      onShared?.()
      return
    } catch (e) {
      if (e && e.name === 'AbortError') return // annulé par l'utilisateur
    }
    openVinted() // repli si le partage échoue
  }

  function downloadPhoto() {
    if (!item?.photo_url) return
    const a = document.createElement('a')
    a.href = item.photo_url
    a.download = `${(item.nom || 'vetement').replace(/\s+/g, '-')}.jpg`
    a.target = '_blank'
    a.rel = 'noopener'
    a.click()
  }

  const fullText = listing
    ? `${listing.titre}\n\n${listing.description}\n\nPrix : ${listing.prix_conseille} €`
    : ''
  const shareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <Modal open={open} onClose={onClose} title="Vendre sur Vinted 💶">
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-10 text-muted">
          <Loader2 className="animate-spin text-accent" />
          <p className="text-sm">
            {isClaudeConfigured ? 'L’IA rédige ton annonce…' : 'Préparation de l’annonce…'}
          </p>
        </div>
      ) : listing ? (
        <div className="space-y-4">
          {isClaudeConfigured && (
            <p className="chip w-fit text-mint">
              <Sparkles size={13} /> Annonce optimisée par l’IA
            </p>
          )}

          {/* Prix conseillé */}
          <div className="flex items-center gap-3 rounded-2xl bg-accent/10 p-3">
            <Tag size={18} className="text-accent" />
            <span className="text-sm text-muted">Prix conseillé</span>
            <div className="ml-auto flex items-center gap-1">
              <input
                type="number"
                value={listing.prix_conseille}
                onChange={(e) => setField('prix_conseille', e.target.value)}
                className="w-20 rounded-lg bg-surface-2 px-2 py-1 text-right font-display text-lg text-accent focus:outline-none"
              />
              <span className="font-display text-lg text-accent">€</span>
            </div>
          </div>

          {/* Titre */}
          <Field
            label="Titre"
            copied={copied === 'titre'}
            onCopy={() => copy('titre', listing.titre)}
          >
            <input
              className="input"
              value={listing.titre}
              onChange={(e) => setField('titre', e.target.value)}
              maxLength={70}
            />
          </Field>

          {/* Description */}
          <Field
            label="Description"
            copied={copied === 'desc'}
            onCopy={() => copy('desc', listing.description)}
          >
            <textarea
              className="input min-h-[140px] resize-y"
              value={listing.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </Field>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" onClick={() => copy('all', fullText)}>
              {copied === 'all' ? <Check size={16} /> : <Copy size={16} />} Tout copier
            </Button>
            {item?.photo_url && (
              <Button variant="ghost" onClick={downloadPhoto}>
                <Download size={16} /> Photo
              </Button>
            )}
          </div>

          {shareSupported ? (
            <>
              <Button variant="primary" className="w-full" onClick={shareToVinted}>
                <Share2 size={18} /> Partager vers Vinted
              </Button>
              <button
                onClick={openVinted}
                className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted hover:text-cream"
              >
                <ExternalLink size={15} /> ou ouvrir Vinted dans le navigateur
              </button>
              <p className="text-center text-xs text-muted">
                Choisis <b className="text-cream">Vinted</b> dans le menu de partage : la
                photo est envoyée et le texte est déjà copié, tu n’as plus qu’à coller. ✨
              </p>
            </>
          ) : (
            <>
              <Button variant="primary" className="w-full" onClick={openVinted}>
                <ExternalLink size={18} /> Ouvrir Vinted et coller
              </Button>
              <p className="text-center text-xs text-muted">
                Le <b className="text-cream">partage direct de la photo vers l’app Vinted</b>{' '}
                s’active en HTTPS sur mobile. Pour l’instant : colle le texte, ajoute la
                photo, publie (~20 s).
              </p>
            </>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

function Field({ label, children, onCopy, copied }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="label-mono">{label}</p>
        <button onClick={onCopy} className="flex items-center gap-1 text-xs text-accent">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      {children}
    </div>
  )
}
