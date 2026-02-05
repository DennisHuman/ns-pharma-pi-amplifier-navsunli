import React from 'react'

type SidebarProviderProps = {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function SidebarProvider({ children, style }: SidebarProviderProps) {
  return (
    <div style={style} className="flex min-h-screen">
      {children}
    </div>
  )
}

type SidebarInsetProps = {
  children: React.ReactNode
}

export function SidebarInset({ children }: SidebarInsetProps) {
  return (
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  )
}

