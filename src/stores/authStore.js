import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { DEMO_PROFILE } from '../lib/demoData'

/**
 * authStore : gère la session + le profil style.
 * En mode démo (pas de Supabase), on simule un utilisateur connecté avec un
 * profil stocké en localStorage.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      loading: true,
      demoMode: !isSupabaseConfigured,

      /** Initialise la session au démarrage. */
      async init() {
        if (!isSupabaseConfigured) {
          // Démo : profil déjà présent ? sinon on attend l'onboarding.
          set({ loading: false })
          return
        }
        const { data } = await supabase.auth.getSession()
        set({ session: data.session, user: data.session?.user ?? null })
        if (data.session?.user) await get().fetchProfile()
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null })
          if (session?.user) get().fetchProfile()
          else set({ profile: null })
        })
        set({ loading: false })
      },

      async fetchProfile() {
        if (!isSupabaseConfigured) return
        const { user } = get()
        if (!user) return
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        set({ profile: data })
      },

      async signInWithEmail(email, password) {
        if (!isSupabaseConfigured) {
          get().enterDemo()
          return { error: null }
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
      },

      async signUpWithEmail(email, password) {
        if (!isSupabaseConfigured) {
          get().enterDemo({ freshOnboarding: true })
          return { error: null }
        }
        const { error } = await supabase.auth.signUp({ email, password })
        return { error }
      },

      async signInWithGoogle() {
        if (!isSupabaseConfigured) {
          get().enterDemo()
          return
        }
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        })
      },

      /** Entre en mode démo (utilisateur fictif connecté). */
      enterDemo({ freshOnboarding = false } = {}) {
        set({
          session: { demo: true },
          user: { id: 'demo-user', email: 'demo@dressingai.app' },
          profile: freshOnboarding ? null : get().profile || DEMO_PROFILE,
          loading: false,
          demoMode: true,
        })
      },

      /** Sauvegarde le profil (onboarding + edits). */
      async saveProfile(patch) {
        const merged = { ...(get().profile || {}), ...patch }
        if (!isSupabaseConfigured) {
          set({ profile: merged })
          return { error: null }
        }
        const { user } = get()
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ id: user.id, ...patch })
        if (!error) set({ profile: merged })
        return { error }
      },

      async addPoints(amount, badge) {
        const profile = get().profile
        if (!profile) return
        const badges = new Set(profile.badges || [])
        if (badge) badges.add(badge)
        await get().saveProfile({
          points: (profile.points || 0) + amount,
          badges: [...badges],
        })
      },

      async signOut() {
        if (isSupabaseConfigured) await supabase.auth.signOut()
        set({ session: null, user: null, profile: null, demoMode: !isSupabaseConfigured })
      },
    }),
    {
      name: 'dressingai-auth',
      // On ne persiste que le profil en mode démo.
      partialize: (state) => (state.demoMode ? { profile: state.profile } : {}),
    },
  ),
)
