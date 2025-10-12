import React from 'react'
import { cn } from '@/lib/utils'

export interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  background?: 'white' | 'gray' | 'transparent'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  transparent: 'bg-transparent'
}

export function PageContainer({
  children,
  className,
  maxWidth = '7xl',
  padding = 'md',
  background = 'gray'
}: PageContainerProps) {
  return (
    <div className={cn(
      'flex-1 overflow-auto',
      backgroundClasses[background],
      className
    )}>
      <div className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding]
      )}>
        {children}
      </div>
    </div>
  )
}

export interface ContentCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'sm' | 'md' | 'lg' | 'none'
}

const cardPaddingClasses = {
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8',
  xl: 'p-10'
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg'
}

export function ContentCard({
  children,
  className,
  padding = 'md',
  shadow = 'sm'
}: ContentCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200',
      cardPaddingClasses[padding],
      shadowClasses[shadow],
      className
    )}>
      {children}
    </div>
  )
}

export interface GridLayoutProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const gridClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10'
}

export function GridLayout({
  children,
  columns = 3,
  gap = 'md',
  className
}: GridLayoutProps) {
  return (
    <div className={cn(
      'grid',
      gridClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}