// Voice input (Web Speech API) + spoken output (speechSynthesis).

export const speechSupported = () =>
  typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text, { rate = 1.02, pitch = 1 } = {}) {
  if (!ttsSupported()) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.pitch = pitch
    const v = window.speechSynthesis.getVoices().find((x) => /en[-_]?(US|GB)/i.test(x.lang))
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
  } catch { /* ignore */ }
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel()
}

// Returns a recognizer or null if unsupported.
export function createRecognizer({ onResult, onEnd, onError } = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  const rec = new SR()
  rec.lang = 'en-US'
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1
  let finalText = ''
  rec.onresult = (e) => {
    let interim = ''
    finalText = ''
    for (let i = 0; i < e.results.length; i++) {
      const t = e.results[i][0].transcript
      if (e.results[i].isFinal) finalText += t
      else interim += t
    }
    onResult?.({ interim, final: finalText })
  }
  rec.onerror = (e) => onError?.(e)
  rec.onend = () => onEnd?.(finalText)
  return rec
}
