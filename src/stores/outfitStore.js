import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { DEMO_HISTORIQUE } from '../lib/demoData'

/**
 * outfitStore : tenues enregistrées + historique de port.
 */
export const useOutfitStore = create(
  persist(
    (set, get) => ({
      tenues: [],
      historique: [],
      loaded: false,

      async load(userId) {
        if (!isSupabaseConfigured) {
          if (!get().loaded) set({ historique: DEMO_HISTORIQUE, loaded: true })
          return
        }
        const [{ data: tenues }, { data: historique }] = await Promise.all([
          supabase.from('tenues').select('*').eq('user_id', userId),
          supabase
            .from('historique_ports')
            .select('*')
            .eq('user_id', userId)
            .order('date_port', { ascending: false }),
        ])
        set({ tenues: tenues || [], historique: historique || [], loaded: true })
      },

      async saveTenue(tenue, userId) {
        if (!isSupabaseConfigured) {
          const local = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...tenue }
          set({ tenues: [local, ...get().tenues] })
          return local
        }
        const { data, error } = await supabase
          .from('tenues')
          .insert({ ...tenue, user_id: userId })
          .select()
          .single()
        if (error) throw error
        set({ tenues: [data, ...get().tenues] })
        return data
      },

      /** Log "Je porte ça !" dans l'historique. */
      async logPort({ vetements, humeur, meteo, tenue_id }, userId, date) {
        const day = date || new Date().toISOString().slice(0, 10)
        const entry = {
          id: crypto.randomUUID(),
          date_port: day,
          humeur,
          meteo,
          vetements,
          tenue_id,
        }
        set({ historique: [entry, ...get().historique] })
        if (isSupabaseConfigured) {
          await supabase.from('historique_ports').insert({
            user_id: userId,
            tenue_id,
            date_port: day,
            humeur,
            meteo,
          })
        }
        return entry
      },
    }),
    {
      name: 'dressingai-outfits',
      partialize: (state) =>
        isSupabaseConfigured
          ? {}
          : { tenues: state.tenues, historique: state.historique, loaded: state.loaded },
    },
  ),
)
