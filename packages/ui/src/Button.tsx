import type { ButtonHTMLAttributes } from 'react'

export function Button({ style, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        marginTop: 16,
        padding: '12px 18px',
        border: 0,
        borderRadius: 10,
        color: '#fff',
        background: '#7c3aed',
        font: 'inherit',
        fontWeight: 700,
        cursor: 'pointer',
        ...style,
      }}
    />
  )
}
