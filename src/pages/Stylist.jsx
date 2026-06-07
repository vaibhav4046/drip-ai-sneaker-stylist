import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { getShoe } from '../data/shoes.js'
import { respond } from '../lib/stylistBrain.js'
import { generateOutfit } from '../lib/outfitEngine.js'
import { careAdvice } from '../lib/care.js'
import { OutfitCard } from '../components/OutfitCard.jsx'
import { AudioViz } from '../components/AudioViz.jsx'
import { Icon } from '../components/Icon.jsx'
import { PageHeader } from '../components/Bits.jsx'
import { speak, stopSpeaking, createRecognizer, speechSupported, ttsSupported } from '../lib/speech.js'

const SUGGESTIONS = ['What should I wear to a date?', 'Style me for the gym', 'Something under 80', 'Festival fit']
let botSeq = 0 // collision-proof message ids

export function Stylist({ onNavigate }) {
  const { closet, weather, profile, setProfile, wearShoe, setBudgetFilter } = useStore()
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hey, I'm DRIP — your sneaker stylist. Tell me where you're headed and I'll build a fit around your kicks." },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [ttsOn, setTtsOn] = useState(false)
  const [aiLive, setAiLive] = useState(null) // null unknown, true real-AI, false local
  const recRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, typing])

  const push = (msg) => setMessages((m) => [...m, msg])

  function handleAction(action) {
    if (!action) return
    if (action.type === 'setStyle') setProfile({ stylePref: action.value })
    if (action.type === 'recommend') {
      const shoe = getShoe(action.shoeId) || closet[0]
      if (shoe) {
        const result = generateOutfit({ shoe, occasionId: action.occasionId, gender: profile.gender, stylePref: profile.stylePref, weather, ownedAccessoryIds: useStore.getState().ownedAccessoryIds })
        push({ role: 'bot', result, shoe })
      }
    }
    if (action.type === 'scan') onNavigate?.('scan')
    if (action.type === 'goCloset') onNavigate?.('closet')
    if (action.type === 'budget') { setBudgetFilter(action.max); onNavigate?.('home') }
  }

  async function send(text) {
    const t = (text ?? input).trim()
    if (!t) return
    push({ role: 'user', text: t })
    setInput('')
    const ctx = {
      closet: closet.map((s) => ({ brand: s.brand, model: s.model, colorway: s.colorway })),
      weather, gender: profile.gender, stylePref: profile.stylePref, currency: profile.currency,
      history: messages.filter((m) => m.text && (m.role === 'user' || m.role === 'bot')).slice(-6).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
    }
    const local = respond(t, ctx)
    // give the AI the exact fit we just generated, so its take matches the card
    if (local.action?.type === 'recommend') {
      const shoe = getShoe(local.action.shoeId) || closet[0]
      if (shoe) {
        const r = generateOutfit({ shoe, occasionId: local.action.occasionId, gender: profile.gender, stylePref: profile.stylePref, weather, ownedAccessoryIds: useStore.getState().ownedAccessoryIds })
        ctx.outfit = { shoe: `${shoe.colorway} ${shoe.model}`, material: shoe.material, occasion: r.occasion.label, top: r.top?.name, bottom: r.bottom?.name, layer: r.layer?.name }
        const care = careAdvice(shoe, weather)
        if (care) ctx.care = care.msg
      }
    }
    const botId = `b${++botSeq}`
    // instant local reply + outfit — never blocked on the network
    push({ role: 'bot', text: local.text, id: botId })
    handleAction(local.action)
    if (ttsOn) speak(local.text)
    // upgrade the text with real AI if a provider key is configured
    setTyping(true)
    try {
      const r = await fetch('/api/stylist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: t, context: ctx }) })
      if (r.ok) {
        const d = await r.json()
        if (d && !d.fallback && d.text) {
          setAiLive(true)
          setMessages((ms) => ms.map((m) => (m.id === botId ? { ...m, text: d.text } : m)))
          if (ttsOn) speak(d.text)
        }
      }
    } catch { /* offline → keep local reply */ }
    setTyping(false)
  }

  function toggleMic() {
    if (listening) { recRef.current?.stop(); return }
    const rec = createRecognizer({
      onResult: ({ interim, final }) => setInput(final || interim),
      onEnd: (finalText) => { setListening(false); if (finalText.trim()) send(finalText) },
      onError: () => setListening(false),
    })
    if (!rec) { alert('Voice input is not supported in this browser.'); return }
    recRef.current = rec; setListening(true); rec.start()
  }
  function toggleTts() { if (ttsOn) stopSpeaking(); setTtsOn((v) => !v) }

  return (
    <div className="flex h-[calc(100dvh-160px)] flex-col">
      <PageHeader title="AI Stylist" sub="Chat or talk — built around your closet"
        right={
          <div className="flex items-center gap-2">
            {aiLive === true && (
              <span className="chip text-[10px]" style={{ background: 'var(--volt)', color: 'var(--volt-ink)', borderColor: 'var(--volt)' }}>
                <Icon name="Zap" size={11} /> AI
              </span>
            )}
            {ttsSupported() && (
              <button onClick={toggleTts} className="flex h-9 w-9 items-center justify-center rounded-full btn-ghost" aria-label="Toggle voice">
                <Icon name={ttsOn ? 'Volume2' : 'VolumeX'} size={17} className={ttsOn ? 'volt-text' : ''} />
              </button>
            )}
          </div>
        } />

      <div ref={scrollRef} aria-live="polite" aria-atomic="false" className="no-scrollbar flex-1 space-y-3 overflow-y-auto pb-2">
        {messages.map((m, i) =>
          m.result ? (
            <div key={i} className="fade-up">
              <OutfitCard result={m.result} shoe={m.shoe} currency={profile.currency}
                onShuffle={() => {
                  const result = generateOutfit({ shoe: m.shoe, occasionId: m.result.occasion.id, gender: profile.gender, stylePref: profile.stylePref, weather, ownedAccessoryIds: useStore.getState().ownedAccessoryIds, variant: Math.floor(Math.random() * 4) })
                  setMessages((ms) => ms.map((x, idx) => (idx === i ? { ...x, result } : x)))
                }}
                onWear={() => wearShoe(m.shoe.id)} />
            </div>
          ) : (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed fade-up ${m.role === 'user' ? 'font-semibold' : ''}`}
                style={m.role === 'user' ? { background: 'var(--volt)', color: 'var(--volt-ink)' } : { background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                {m.text}
              </div>
            </div>
          ),
        )}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl px-4 py-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
              {[0, 1, 2].map((d) => <span key={d} className="typing-dot h-2 w-2 rounded-full" style={{ background: 'var(--muted)', animationDelay: `${d * 0.18}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="chip whitespace-nowrap text-xs">{s}</button>)}
        </div>
      )}

      {listening && (
        <div className="card mb-2 flex items-center gap-3 p-2">
          <AudioViz active={listening} />
          <span className="pr-2 text-xs font-semibold volt-text">Listening…</span>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-2xl p-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
        {speechSupported() && (
          <button onClick={toggleMic} className="btn p-2.5" style={listening ? { background: 'var(--volt)', color: 'var(--volt-ink)' } : { background: 'transparent' }} aria-label="Voice"><Icon name="Mic" size={20} /></button>
        )}
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask DRIP anything…" aria-label="Message the stylist" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none" />
        <button onClick={() => send()} className="btn btn-primary p-2.5" aria-label="Send"><Icon name="Send" size={20} /></button>
      </div>
    </div>
  )
}
