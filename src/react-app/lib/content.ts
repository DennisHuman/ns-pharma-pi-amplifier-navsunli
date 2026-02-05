export type GlossaryItem = { term: string; definition: string }
export type Section = {
  id: string
  title: string
  bodyMd: string
  bodyUrl?: string
  bodyFormat?: 'html' | 'md'
  subsections?: Array<{
    id: string
    title: string
    bodyMd: string
    bodyUrl?: string
    bodyFormat?: 'html' | 'md'
  }>
}
export type QuizQuestion = {
  id: string
  type: 'single' | 'multiple' | 'boolean'
  prompt: string
  choices: string[]
  answer: number[]
  explanation?: string
}
export type Quiz = { passPct: number; questions: QuizQuestion[] }
export type Content = {
  product: { id: string; name: string; version: string; lang: string; overview?: string }
  theme?: { primary?: string; accent?: string }
  overviewSections?: Array<{
    title: string
    content?: string
    bullets?: Array<{
      text: string
      refs?: string[] // section or subsection ids
    }>
  }>
  overviewBlackBoxHtml?: string
  sections: Section[]
  glossary?: GlossaryItem[]
  quiz: Quiz
  submission: { channel: 'postMessage'; targetOrigin: string }
}

export function getQueryParam(name: string): string | null {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

export function getContentBase(): string {
  const fromEnv = (import.meta as any).env?.VITE_CONTENT_BASE_URL as string | undefined
  return (fromEnv && fromEnv.trim().length > 0) ? fromEnv.replace(/\/+$/, '') : '/content'
}

export async function loadContent(): Promise<Content> {
  const productId = getQueryParam('productId') || 'sample-product'
  const base = getContentBase()
  const res = await fetch(`${base}/products/${productId}/content.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load content ${productId}: ${res.status}`)
  return res.json()
}

