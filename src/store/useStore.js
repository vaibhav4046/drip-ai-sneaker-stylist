import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SHOES, getShoe } from '../data/shoes.js'

const seedCloset = () =>
  ['nike-dunk-panda', 'adidas-samba-og']
    .map((id) => getShoe(id))
    .filter(Boolean)
    .map((s) => ({ ...s, addedAt: Date.now(), wears: 0, lastWorn: null }))

const MAX_INTERACTIONS = 250

export const useStore = create(
  persist(
    (set, get) => ({
      closet: seedCloset(),
      ownedAccessoryIds: ['a-cap'],
      likes: [],
      interactions: [],
      recentSearches: [],
      lookbook: [],
      profile: {
        name: '',
        gender: 'unisex',
        stylePref: 'minimal',
        currency: 'USD',
        quizDone: false,
      },
      weather: null,
      streak: 0,
      lastVisit: null,
      onboarded: false,
      toast: null,
      budgetFilter: null, // transient — set by stylist "under $X"

      setBudgetFilter: (v) => set({ budgetFilter: v }),

      // daily check-in → streak
      checkIn: () =>
        set((st) => {
          const today = new Date().toISOString().slice(0, 10)
          if (st.lastVisit === today) return {}
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          const streak = st.lastVisit === yesterday ? (st.streak || 0) + 1 : 1
          return { lastVisit: today, streak }
        }),
      dismissOnboarding: () => set({ onboarded: true }),
      showToast: (msg) => set({ toast: { msg, id: Date.now() } }),
      clearToast: () => set({ toast: null }),

      // save-a-fit lookbook
      saveFit: (fit) =>
        set((st) => {
          if (st.lookbook.some((f) => f.id === fit.id)) return { toast: { msg: 'Already in your lookbook', id: Date.now() } }
          return { lookbook: [{ ...fit, ts: Date.now() }, ...st.lookbook].slice(0, 40), toast: { msg: 'Saved to lookbook', id: Date.now() } }
        }),
      removeFit: (id) => set((st) => ({ lookbook: st.lookbook.filter((f) => f.id !== id) })),

      // ---- engagement signals ----
      track: (type, shoeId) => {
        if (!shoeId) return
        set((st) => ({
          interactions: [{ type, shoeId, ts: Date.now() }, ...st.interactions].slice(0, MAX_INTERACTIONS),
        }))
      },
      toggleLike: (shoeId) =>
        set((st) => {
          const liked = st.likes.includes(shoeId)
          return {
            likes: liked ? st.likes.filter((x) => x !== shoeId) : [shoeId, ...st.likes],
            interactions: liked
              ? st.interactions
              : [{ type: 'like', shoeId, ts: Date.now() }, ...st.interactions].slice(0, MAX_INTERACTIONS),
          }
        }),
      addSearch: (q) => {
        const query = (q || '').trim()
        if (!query) return
        set((st) => ({
          recentSearches: [query, ...st.recentSearches.filter((x) => x.toLowerCase() !== query.toLowerCase())].slice(0, 8),
        }))
      },

      // ---- closet ----
      addShoe: (shoeOrId) => {
        const shoe = typeof shoeOrId === 'string' ? getShoe(shoeOrId) : shoeOrId
        if (!shoe) return
        if (get().closet.some((s) => s.id === shoe.id)) return
        set((st) => ({
          closet: [{ ...shoe, addedAt: Date.now(), wears: 0, lastWorn: null }, ...st.closet],
          interactions: [{ type: 'add', shoeId: shoe.id, ts: Date.now() }, ...st.interactions].slice(0, MAX_INTERACTIONS),
          toast: { msg: `${shoe.model} added to closet`, id: Date.now() },
        }))
      },
      removeShoe: (id) => set((st) => ({ closet: st.closet.filter((s) => s.id !== id) })),
      wearShoe: (id) =>
        set((st) => ({
          closet: st.closet.map((s) => (s.id === id ? { ...s, wears: (s.wears || 0) + 1, lastWorn: Date.now() } : s)),
          interactions: [{ type: 'wear', shoeId: id, ts: Date.now() }, ...st.interactions].slice(0, MAX_INTERACTIONS),
          toast: { msg: 'Nice — wear logged', id: Date.now() },
        })),

      toggleAccessory: (id) =>
        set((st) => ({
          ownedAccessoryIds: st.ownedAccessoryIds.includes(id)
            ? st.ownedAccessoryIds.filter((a) => a !== id)
            : [...st.ownedAccessoryIds, id],
        })),

      setProfile: (patch) => set((st) => ({ profile: { ...st.profile, ...patch } })),
      setWeather: (w) => set({ weather: w }),

      resetAll: () =>
        set({
          closet: seedCloset(),
          ownedAccessoryIds: ['a-cap'],
          likes: [],
          interactions: [],
          recentSearches: [],
          lookbook: [],
          profile: { name: '', gender: 'unisex', stylePref: 'minimal', currency: 'USD', quizDone: false },
          streak: 0, lastVisit: null, onboarded: false,
        }),
    }),
    {
      name: 'drip-store',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted) => {
        if (!persisted) return persisted
        persisted.likes = persisted.likes || []
        persisted.interactions = persisted.interactions || []
        persisted.recentSearches = persisted.recentSearches || []
        // Re-hydrate closet shoes with current catalog data (photo, styleTags, popularity)
        // while preserving wear history.
        if (Array.isArray(persisted.closet)) {
          persisted.closet = persisted.closet.map((s) => {
            const fresh = getShoe(s.id)
            return fresh ? { ...fresh, addedAt: s.addedAt || Date.now(), wears: s.wears || 0, lastWorn: s.lastWorn ?? null } : s
          })
        }
        return persisted
      },
      partialize: (st) => ({
        closet: st.closet,
        ownedAccessoryIds: st.ownedAccessoryIds,
        likes: st.likes,
        interactions: st.interactions,
        recentSearches: st.recentSearches,
        lookbook: st.lookbook,
        profile: st.profile,
        streak: st.streak,
        lastVisit: st.lastVisit,
        onboarded: st.onboarded,
      }),
    },
  ),
)

export { SHOES }
