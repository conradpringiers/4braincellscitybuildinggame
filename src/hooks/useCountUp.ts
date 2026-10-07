import { useEffect, useRef, useState } from 'react'

/**
 * Smoothly animates a number toward its target value.
 * Used for the living population counter and indicator readouts.
 */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target)
  const prevRef = useRef(target)
  const rafRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    if (from === target) return
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const next = from + (target - from) * eased
      setValue(next)
      prevRef.current = next
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}
