// Occasions drive the outfit engine's formality target and tag preferences.
// icon = lucide-react component name (resolved in components/Icon.jsx)
export const OCCASIONS = [
  { id: 'casual', label: 'Casual', icon: 'Coffee', formality: 1, prefer: ['staple', 'minimal', 'street'], blurb: 'Everyday, low-effort, clean.' },
  { id: 'date', label: 'Date Night', icon: 'Heart', formality: 3, prefer: ['date', 'smart', 'evening'], blurb: 'Sharp but relaxed. Make an impression.' },
  { id: 'work', label: 'Work', icon: 'Briefcase', formality: 4, prefer: ['smart', 'classic'], blurb: 'Put-together, office-ready.' },
  { id: 'gym', label: 'Gym', icon: 'Dumbbell', formality: 1, prefer: ['gym', 'summer'], blurb: 'Move freely. Performance first.' },
  { id: 'movies', label: 'Movies', icon: 'Clapperboard', formality: 2, prefer: ['street', 'cozy', 'staple'], blurb: 'Comfy, warm, easy.' },
  { id: 'party', label: 'Party', icon: 'PartyPopper', formality: 3, prefer: ['statement', 'evening', 'street'], blurb: 'Turn it up. Stand out.' },
  { id: 'festival', label: 'Festival', icon: 'Music', formality: 2, prefer: ['statement', 'festival', 'street'], blurb: 'Bold, expressive, durable.' },
  { id: 'wedding', label: 'Wedding', icon: 'Gem', formality: 5, prefer: ['formal', 'wedding', 'classic'], blurb: 'Formal and refined.' },
  { id: 'travel', label: 'Travel', icon: 'Plane', formality: 2, prefer: ['travel', 'cozy', 'staple'], blurb: 'Comfort for long days.' },
  { id: 'outdoor', label: 'Outdoor', icon: 'Mountain', formality: 1, prefer: ['outdoor', 'utility', 'rain'], blurb: 'Built for the elements.' },
  { id: 'proposal', label: 'Proposal', icon: 'Diamond', formality: 5, prefer: ['formal', 'smart', 'classic'], blurb: 'The big moment. Look unforgettable.' },
  { id: 'prayer', label: 'Prayer', icon: 'Moon', formality: 4, prefer: ['cultural', 'prayer', 'modest'], blurb: 'Respectful, modest, comfortable.', modest: true },
]

export const getOccasion = (id) => OCCASIONS.find((o) => o.id === id) || OCCASIONS[0]
