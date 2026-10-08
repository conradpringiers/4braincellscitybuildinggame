import type { SVGProps } from 'react'

export type IconName =
  | 'city'
  | 'alert'
  | 'scroll'
  | 'flag'
  | 'ballot'
  | 'leaf'
  | 'chat'
  | 'user'
  | 'plus'
  | 'close'
  | 'chevron'
  | 'check'
  | 'sparkle'
  | 'send'
  | 'key'
  | 'hammer'
  | 'megaphone'
  | 'users'
  | 'coin'
  | 'brain'
  | 'clock'
  | 'shield'

const P: Record<IconName, string> = {
  city: 'M3 21h18M5 21V8l5-3v16M14 21V11l5-2v12M8 12h.01M8 16h.01M17 13h.01M17 17h.01',
  alert: 'M12 3 2.5 20h19L12 3zM12 10v4M12 17.5h.01',
  scroll: 'M7 4h10a2 2 0 0 1 2 2v13a2 2 0 0 0 2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 9h6M9 13h6',
  flag: 'M5 21V4M5 5h11l-2 3 2 3H5',
  ballot: 'M5 4h14v16H5zM9 12l2 2 4-4',
  leaf: 'M20 4C11 4 5 8 5 15a5 5 0 0 0 5 5c7 0 10-6 10-16zM8 18c2-4 5-6 9-8',
  chat: 'M4 5h16v11H9l-5 4V5zM8 10h8M8 13h5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M9 6l6 6-6 6',
  check: 'M4 12l5 5L20 6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  send: 'M4 12l16-8-6 16-3-6-7-2z',
  key: 'M14 7a4 4 0 1 1 3.5 4L15 13.5l-1.5 1.5-1.5-1.5-1.5 1.5L9 13.5 7.5 15 4 11.5 8 7.5h6zM17 6h.01',
  hammer: 'M14 7l3-3 4 4-3 3M13 8 4 17l3 3 9-9M11 4l4 4',
  megaphone: 'M4 10v5h3l1 5h3l-1-5h2l7 4V5l-7 5H6zM19 9a3 3 0 0 1 0 6',
  users: 'M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.5 3.2-5.5 7-5.5s7 2 7 5.5M16 5.5a3.5 3.5 0 0 1 0 6.6M18 20c0-2.2-.6-3.8-1.6-4.9',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.5 9.5A3 3 0 1 0 12 15h1.5M12 7v10',
  brain: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8V16a3 3 0 0 0 4 2.8V4.8A3 3 0 0 0 9 4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8V16a3 3 0 0 1-4 2.8V4.8A3 3 0 0 1 15 4zM12 4v16',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
}

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
  filled?: boolean
}

export function Icon({ name, size = 20, filled = false, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={P[name]} />
    </svg>
  )
}
