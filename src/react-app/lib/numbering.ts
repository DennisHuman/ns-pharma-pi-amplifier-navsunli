import type { Content } from '@/lib/content'

type Section = NonNullable<Content['sections']>[number]

export function getSectionNumber(sections: Section[], id: string): string {
  const idx = sections.findIndex(s => s.id === id)
  return idx >= 0 ? String(idx + 1) : ''
}

export function getSubNumber(sections: Section[], parentId: string, subId: string): string {
  const parent = sections.find(s => s.id === parentId)
  if (!parent?.subsections) return ''
  const parentIdx = sections.findIndex(s => s.id === parentId)
  const subIdx = parent.subsections.findIndex(s => s.id === subId)
  if (parentIdx < 0 || subIdx < 0) return ''
  return `${parentIdx + 1}.${subIdx + 1}`
}

export function getRefNumber(sections: Section[], id: string): string {
  const secIdx = sections.findIndex(s => s.id === id)
  if (secIdx >= 0) return String(secIdx + 1)
  const parentIdx = sections.findIndex(s => s.subsections?.some(sub => sub.id === id))
  if (parentIdx >= 0) {
    const subIdx = sections[parentIdx].subsections!.findIndex(sub => sub.id === id)
    if (subIdx >= 0) return `${parentIdx + 1}.${subIdx + 1}`
  }
  return '?'
}

