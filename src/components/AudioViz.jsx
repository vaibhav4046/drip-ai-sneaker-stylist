import { useEffect, useRef } from 'react'

// Real-time mic waveform via Web Audio API. Falls back to an animated wave if mic denied.
export function AudioViz({ active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const ctxRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!active) return
    let analyser, data, fallback = false, phase = 0

    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const w = (canvas.width = canvas.offsetWidth * 2)
      const h = (canvas.height = canvas.offsetHeight * 2)
      ctx.clearRect(0, 0, w, h)
      const bars = 40
      let values
      if (analyser && !fallback) {
        analyser.getByteFrequencyData(data)
        values = Array.from({ length: bars }, (_, i) => data[Math.floor(i * data.length / bars)] / 255)
      } else {
        phase += 0.15
        values = Array.from({ length: bars }, (_, i) => 0.3 + 0.35 * Math.abs(Math.sin(phase + i * 0.4)))
      }
      const bw = w / bars
      for (let i = 0; i < bars; i++) {
        const bh = Math.max(4, values[i] * h * 0.9)
        const x = i * bw
        const grad = ctx.createLinearGradient(0, h, 0, h - bh)
        grad.addColorStop(0, '#9aa800')
        grad.addColorStop(1, '#ccff02')
        ctx.fillStyle = grad
        const r = bw * 0.28
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(x + bw * 0.2, (h - bh) / 2, bw * 0.6, bh, r)
        else ctx.rect(x + bw * 0.2, (h - bh) / 2, bw * 0.6, bh)
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream
        const AC = window.AudioContext || window.webkitAudioContext
        const ac = new AC()
        ctxRef.current = ac
        const src = ac.createMediaStreamSource(stream)
        analyser = ac.createAnalyser()
        analyser.fftSize = 128
        data = new Uint8Array(analyser.frequencyBinCount)
        src.connect(analyser)
        draw()
      })
      .catch(() => { fallback = true; draw() })

    return () => {
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      ctxRef.current?.close?.()
    }
  }, [active])

  return <canvas ref={canvasRef} className="h-12 w-full" />
}
