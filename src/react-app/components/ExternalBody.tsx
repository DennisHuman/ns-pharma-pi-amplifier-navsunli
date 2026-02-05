import { useEffect, useState, useRef } from 'react'
import { HtmlText } from '@/components/HtmlText'

type ExternalBodyProps = {
  url: string
  format?: 'html' | 'md'
}

// Updates scroll shadow classes on table wrappers
function setupTableScrollShadows(container: HTMLElement | null) {
  if (!container) return () => {}
  
  const wrappers = container.querySelectorAll('.table-wrapper')
  const listeners: Array<() => void> = []
  
  wrappers.forEach((wrapper) => {
    const el = wrapper as HTMLElement
    
    const updateShadows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el
      const canScrollLeft = scrollLeft > 2
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 2
      
      el.classList.toggle('can-scroll-left', canScrollLeft)
      el.classList.toggle('can-scroll-right', canScrollRight)
    }
    
    // Initial check
    updateShadows()
    
    // Listen for scroll
    el.addEventListener('scroll', updateShadows, { passive: true })
    listeners.push(() => el.removeEventListener('scroll', updateShadows))
    
    // Recheck on resize
    const resizeObserver = new ResizeObserver(updateShadows)
    resizeObserver.observe(el)
    listeners.push(() => resizeObserver.disconnect())
  })
  
  return () => listeners.forEach(cleanup => cleanup())
}

export function ExternalBody({ url, format = 'html' }: ExternalBodyProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    setHtml(null)
    setError(null)
    fetch(url, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ${url}: ${res.status}`)
        }
        const text = await res.text()
        // For now we only support pre-compiled HTML.
        if (format !== 'html') {
          throw new Error(`Unsupported format '${format}'. Provide precompiled HTML.`)
        }
        if (mounted) setHtml(text)
      })
      .catch((e) => {
        if (mounted) setError(e?.message || 'Failed to load content')
      })
    return () => {
      mounted = false
    }
  }, [url, format])

  // Setup table scroll shadows after HTML is rendered
  useEffect(() => {
    if (!html) return
    // Small delay to ensure DOM is updated
    let cleanup: (() => void) | undefined
    const timer = setTimeout(() => {
      cleanup = setupTableScrollShadows(containerRef.current)
    }, 50)
    return () => {
      clearTimeout(timer)
      cleanup?.()
    }
  }, [html])

  if (error) return <p>Error: {error}</p>
  if (html == null) return <p>Loading content…</p>
  return (
    <div ref={containerRef}>
      <HtmlText html={html} as="div" />
    </div>
  )
}

