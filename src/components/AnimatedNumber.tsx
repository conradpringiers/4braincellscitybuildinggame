import { useCountUp } from '../hooks/useCountUp'

/** A number that animates smoothly toward its target value. */
export function AnimatedNumber({ value, duration = 700 }: { value: number; duration?: number }) {
  const shown = useCountUp(value, duration)
  return <>{Math.round(shown).toLocaleString()}</>
}
