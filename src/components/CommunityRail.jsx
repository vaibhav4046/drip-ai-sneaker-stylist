import { useState, useEffect } from 'react'
import { Icon } from './Icon.jsx'
import { SectionHeader } from './Bits.jsx'

const SOURCE_ICON = { Reddit: 'Flame', YouTube: 'Clapperboard', 'Sneaker News': 'Zap', 'Nice Kicks': 'Zap', 'Just Fresh Kicks': 'Zap' }

function PostCard({ post }) {
  const [imgOk, setImgOk] = useState(!!post.image)
  return (
    <a href={post.link} target="_blank" rel="noreferrer" className="w-64 shrink-0 snap-start">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shoe-tap" style={{ background: '#16161a' }}>
        {imgOk ? (
          <img src={post.image} alt="" loading="lazy" decoding="async" onError={() => setImgOk(false)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(140deg,#1c1c22,#0e0e12)' }}>
            <Icon name={SOURCE_ICON[post.source] || 'Flame'} size={26} className="muted" />
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <Icon name={SOURCE_ICON[post.source] || 'Flame'} size={11} /> {post.source}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 px-1 text-sm font-semibold leading-snug">{post.title}</p>
    </a>
  )
}

export function CommunityRail() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let alive = true
    fetch('/api/feed')
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => { if (alive) setItems(d.items || []) })
      .catch(() => { if (alive) setItems([]) })
    return () => { alive = false }
  }, [])

  if (!items || items.length === 0) return null // hide gracefully (e.g. local dev where /api isn't served)

  return (
    <div>
      <SectionHeader title="Trending in the community" icon="Flame" />
      <div className="no-scrollbar snap-x flex gap-3 overflow-x-auto pb-1">
        {items.map((p, i) => <PostCard key={p.link + i} post={p} />)}
      </div>
    </div>
  )
}
