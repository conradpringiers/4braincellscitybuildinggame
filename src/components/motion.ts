import type { CSSProperties } from 'react'

/**
 * Small helper for staggered list entrances.
 * Pair `.stagger` (container) + `.rise` (items) with this index style.
 */
export const stagger = (i: number): CSSProperties => ({ '--i': i } as CSSProperties)
