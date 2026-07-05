import { useState } from 'react'
import { Camera, Wand2, Loader2, Check, Trash2, ShoppingBag } from 'lucide-react'
import Button from '../ui/Button'
import { CATEGORIES, SAISONS, OCCASIONS, TAGS } from '../../lib/constants'
import { useClaudeVision } from '../../hooks/useClaudeVision'
import { uploadClothingPhoto, isSupabaseConfigured } from '../../lib/supabase'

const STYLE_OPTIONS = ['casual', 'chic', 'sport', 'soirée', 'vintage', 'streetwear', 'boho', 'minimaliste']

/** Formulaire d'ajout : photo → auto-tag IA → correction manuelle → save. */
export default function AddClothingForm({ userId, onSave, onColors, initial = null, onDelete, onSell }) {
  const isEdit = Boolean(initial)
  const { analyze, analyzing, isConfigured } = useClaudeVision()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(initial?.photo_url || null)
  const [autofilled, setAutofilled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [form, setForm] = useState({
    nom: initial?.nom || '',
    categorie: initial?.categorie || 'haut',
    couleur_dominante: initial?.couleur_dominante || '',
    couleur_hex: initial?.couleur_hex || '#888888',
    couleurs_secondaires: initial?.couleurs_secondaires || [],
    style: initial?.style || [],
    saison: initial?.saison || [],
    occasion: initial?.occasion || [],
    marque: initial?.marque || '',
    taille: initial?.taille || '',
    prix_achat: initial?.prix_achat ?? '',
    tags: initial?.tags || [],
  })

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))
  const toggleArr = (key, val) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }))

  async function handleFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setAutofilled(false)
    const result = await analyze(f)
    if (result) {
      update({
        nom: result.nom || '',
        categorie: result.categorie || 'haut',
        couleur_dominante: result.couleur_dominante || '',
        couleur_hex: result.couleur_hex || '#888888',
        couleurs_secondaires: result.couleurs_secondaires || [],
        style: result.style || [],
        saison: result.saison || [],
        occasion: result.occasion || [],
      })
      setAutofilled(true)
      onColors?.([result.couleur_hex, ...(result.couleurs_secondaires || [])].filter(Boolean))
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      let photo_url = initial?.photo_url || null
      if (file && isSupabaseConfigured && userId && userId !== 'demo-user') {
        try {
          photo_url = await uploadClothingPhoto(userId, file)
        } catch {
          // L'upload de la photo a échoué (stockage) : on enregistre quand même
          // la pièce, sans bloquer l'utilisateur.
          setSaveError('Photo non enregistrée, mais la pièce a bien été ajoutée.')
        }
      }
      await onSave({
        ...form,
        prix_achat: form.prix_achat ? Number(form.prix_achat) : null,
        photo_url,
      })
    } catch (e) {
      setSaveError(e.message || 'Erreur à l’enregistrement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Zone photo — <label> natif : ouvre l'appareil photo / la galerie
          de façon fiable (y compris sur iPhone, sans click() JS). */}
      <div className="flex gap-4">
        <label
          className="relative grid h-28 w-28 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-3xl border border-dashed border-white/20 bg-surface-2"
          style={preview ? { borderStyle: 'solid' } : undefined}
        >
          {preview ? (
            <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
          ) : (
            <div className="text-center text-muted">
              <Camera className="mx-auto mb-1" size={22} />
              <span className="text-[11px]">Photo</span>
            </div>
          )}
          {analyzing && (
            <div className="absolute inset-0 grid place-items-center bg-bg/70 backdrop-blur-sm">
              <Loader2 className="animate-spin text-accent" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        <div className="flex flex-col justify-center gap-2">
          <p className="text-sm text-muted">
            {isEdit
              ? 'Touche la photo pour la remplacer.'
              : isConfigured
                ? 'L’IA analyse la photo et pré-remplit les champs.'
                : 'Mode démo : couleur détectée automatiquement. Active l’IA pour l’analyse complète.'}
          </p>
          {autofilled && (
            <span className="chip w-fit text-mint">
              <Wand2 size={13} /> Auto-rempli
            </span>
          )}
        </div>
      </div>

      {/* Champs */}
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Nom (ex: Chemise lin beige)"
          value={form.nom}
          onChange={(e) => update({ nom: e.target.value })}
        />

        <div>
          <p className="label-mono mb-1.5">Catégorie</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => update({ categorie: c.id })}
                className={`chip ${form.categorie === c.id ? 'bg-accent text-bg border-accent' : ''}`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.couleur_hex}
            onChange={(e) => update({ couleur_hex: e.target.value })}
            className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent"
          />
          <input
            className="input flex-1"
            placeholder="Couleur dominante"
            value={form.couleur_dominante}
            onChange={(e) => update({ couleur_dominante: e.target.value })}
          />
        </div>

        <MultiField label="Style" options={STYLE_OPTIONS} selected={form.style} onToggle={(v) => toggleArr('style', v)} />
        <MultiField label="Saison" options={SAISONS} selected={form.saison} onToggle={(v) => toggleArr('saison', v)} />
        <MultiField label="Occasion" options={OCCASIONS} selected={form.occasion} onToggle={(v) => toggleArr('occasion', v)} />

        <div className="grid grid-cols-3 gap-2">
          <input className="input" placeholder="Marque" value={form.marque} onChange={(e) => update({ marque: e.target.value })} />
          <input className="input" placeholder="Taille" value={form.taille} onChange={(e) => update({ taille: e.target.value })} />
          <input className="input" placeholder="Prix €" type="number" value={form.prix_achat} onChange={(e) => update({ prix_achat: e.target.value })} />
        </div>

        <div>
          <p className="label-mono mb-1.5">Statut</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleArr('tags', t.id)}
                className={`chip ${form.tags.includes(t.id) ? 'bg-accent/20 border-accent/50 text-accent' : ''}`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {saveError && <p className="text-sm text-coral">{saveError}</p>}

      <Button variant="primary" className="w-full" onClick={handleSave} disabled={saving || !form.nom}>
        {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
        {isEdit ? 'Enregistrer les modifications' : 'Ajouter au dressing'}
      </Button>

      {isEdit && onSell && (
        <button
          onClick={onSell}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-mint/10 py-3 text-mint transition hover:bg-mint/20"
        >
          <ShoppingBag size={16} /> Vendre sur Vinted
        </button>
      )}

      {isEdit && onDelete && (
        <button
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-coral/10 py-3 text-coral transition hover:bg-coral/20"
        >
          <Trash2 size={16} /> Supprimer cette pièce
        </button>
      )}
    </div>
  )
}

function MultiField({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="label-mono mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={`chip ${selected.includes(o) ? 'bg-mint/20 border-mint/50 text-mint' : ''}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
