// Display formatting helpers

// "19:00:00" -> "7pm", "19:30:00" -> "7:30pm" (wireframe style: "7pm to 9pm")
export function formatTime(time?: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h)) return time
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return m ? `${h12}:${String(m).padStart(2, '0')}${ampm}` : `${h12}${ampm}`
}
