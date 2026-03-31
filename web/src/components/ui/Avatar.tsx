import { HTMLAttributes } from 'react'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  ...props
}: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={`
        relative inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium overflow-hidden
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <span className="text-gray-400">?</span>
      )}
    </div>
  )
}
