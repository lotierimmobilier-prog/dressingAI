import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { DEMO_VETEMENTS } from '../lib/demoData'

/**
 * wardrobeStore : source de vérité du dressing.
 * Mode démo → localStorage. Mode Supabase → table `vetements`.
 */
export const useWardrobeStore = create(
  persist(
    (set, get) => ({
      items: [],
      loaded: false,

      async load(userId) {
        if (!isSupabaseConfigured) {
          // Mode démo : on démarre avec un dressing VIDE. Chacun ajoute ses
          // propres pièces (appareil photo / +). Les 12 exemples restent
          // disponibles à la demande via seedDemo().
          if (!get().loaded) set({ items: [], loaded: true })
          return
        }
        const { data } = await supabase
          .from('vetements')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        set({ items: data || [], loaded: true })
      },

      /** Remplit le dressing avec les 12 pièces d'exemple (photos incluses). */
      async seedDemo(userId) {
        for (const it of DEMO_VETEMENTS) {
          // On retire les champs propres à la démo (id local, repli d'image).
          const { id, photo_fallback, ...rest } = it
          // eslint-disable-next-line no-await-in-loop
          await get().add(rest, userId)
        }
      },

      async add(item, userId) {
        if (!isSupabaseConfigured) {
          const local = { id: crypto.randomUUID(), nb_ports: 0, tags: [], ...item }
          set({ items: [local, ...get().items] })
          return local
        }
        const { data, error } = await supabase
          .from('vetements')
          .insert({ ...item, user_id: userId })
          .select()
          .single()
        if (error) throw error
        set({ items: [data, ...get().items] })
        return data
      },

      async update(id, patch) {
        set({
          items: get().items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })
        if (isSupabaseConfigured) {
          await supabase.from('vetements').update(patch).eq('id', id)
        }
      },

      async remove(id) {
        set({ items: get().items.filter((it) => it.id !== id) })
        if (isSupabaseConfigured) {
          await supabase.from('vetements').delete().eq('id', id)
        }
      },

      /** Incrémente le compteur de port + met à jour la date. */
      async wear(id, date = new Date().toISOString().slice(0, 10)) {
        const item = get().items.find((it) => it.id === id)
        if (!item) return
        await get().update(id, {
          nb_ports: (item.nb_ports || 0) + 1,
          derniere_date_port: date,
        })
      },

      toggleTag(id, tag) {
        const item = get().items.find((it) => it.id === id)
        if (!item) return
        const tags = new Set(item.tags || [])
        if (tags.has(tag)) tags.delete(tag)
        else tags.add(tag)
        get().update(id, { tags: [...tags] })
      },

      byId(id) {
        return get().items.find((it) => it.id === id) || null
      },
    }),
    {
      name: 'dressingai-wardrobe',
      // v1 : on ne pré-remplit plus le dressing avec les pièces de démo.
      // Cette migration vide, une seule fois, le dressing de démo déjà stocké
      // localement pour repartir d'un dressing vide (les vraies pièces ajoutées
      // par l'utilisateur, s'il y en a, ne sont pas concernées côté Supabase).
      version: 1,
      migrate: (persisted, version) => {
        if (version < 1) return { items: [], loaded: false }
        return persisted
      },
      partialize: (state) =>
        isSupabaseConfigured ? {} : { items: state.items, loaded: state.loaded },
    },
  ),
)
