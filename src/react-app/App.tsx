import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { type Content, loadContent, getContentBase } from '@/lib/content'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { House, BookOpen, BookBookmark, Exam, Square, List } from '@phosphor-icons/react'
import BrandLogo from '@/assets/navsunli_Logo.svg'
import NsPharmaLogo from '@/assets/NS_Pharma-Logo.svg'
import { SectionBody } from '@/components/SectionBody'
import { ExternalBody } from '@/components/ExternalBody'
import { Overview } from '@/components/reader/Overview'
import { Glossary } from '@/components/reader/Glossary'
import { Quiz } from '@/components/reader/Quiz'
import { BlackBox } from '@/components/reader/BlackBox'
import { getSectionNumber, getSubNumber, getRefNumber } from '@/lib/numbering'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

function App() {
  const [content, setContent] = useState<Content | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showContentNav, setShowContentNav] = useState<boolean>(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [mobileContentDrawerOpen, setMobileContentDrawerOpen] = useState<boolean>(false)
  
  useEffect(() => {
    let mounted = true
    loadContent()
      .then(c => {
        if (!mounted) return
        setContent(c)
        // Default to overview if no hash
        const hashId = window.location.hash?.slice(1)
        const validIds = new Set<string>(['overview', 'glossary', 'quiz', 'blackbox', ...c.sections.map(s => s.id)])
        setActiveId(hashId && validIds.has(hashId) ? hashId : 'overview')
      })
      .catch(e => {
        if (!mounted) return
        setError(e?.message || 'Failed to load content')
      })
    return () => {
      mounted = false
    }
  }, [])

  // Handle deep-link on hash change (section or subsection id)
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash?.slice(1)
      if (!id) return
      goToId(id)
    }
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [content])

  const sections = content?.sections ?? []
  const glossary = content?.glossary ?? []
  
  // Check if current active ID is a content section or subsection
  const isContentActive = useMemo(() => {
    if (!activeId) return false
    if (['overview', 'glossary', 'quiz', 'blackbox'].includes(activeId)) return false
    return true
  }, [activeId])
  
  useEffect(() => {
    // Show content nav when a content section is active
    setShowContentNav(isContentActive)
  }, [isContentActive])

  // Auto-expand section when navigating to it or its subsection (accordion style - only one expanded)
  useEffect(() => {
    if (!activeId || !sections.length) return
    
    // Check if activeId is a section with subsections
    const activeSection = sections.find(s => s.id === activeId)
    if (activeSection) {
      if (activeSection.subsections?.length) {
        // Section has children - expand it, collapse others
        setExpandedSections(new Set([activeId]))
      } else {
        // Section has no children - collapse all
        setExpandedSections(new Set())
      }
      return
    }
    
    // Check if activeId is a subsection - expand only its parent
    const parentSection = sections.find(s => s.subsections?.some(sub => sub.id === activeId))
    if (parentSection) {
      setExpandedSections(new Set([parentSection.id]))
    }
  }, [activeId, sections])
  const sectionNumber = (id: string) => getSectionNumber(sections, id)
  const subNumber = (parentId: string, subId: string) => getSubNumber(sections, parentId, subId)
  const refNumber = (id: string) => getRefNumber(sections, id)
  const [glossaryQuery, setGlossaryQuery] = useState('')
  const filteredGlossary = useMemo(() => {
    const q = glossaryQuery.trim().toLowerCase()
    if (!q) return glossary
    return glossary.filter(
      g => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)
    )
  }, [glossary, glossaryQuery])

  function goToId(id: string) {
    if (!id) return
    if (id === 'overview') {
      setActiveId('overview')
      document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', '#overview')
      return
    }
    const sec = sections.find(s => s.id === id)
    if (sec) {
      setActiveId(sec.id)
      document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
      return
    }
    const parent = sections.find(s => s.subsections?.some(sub => sub.id === id))
    if (parent) {
      // Open subsection as its own page
      setActiveId(id)
      document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
    }
  }

  return (
    <SidebarProvider
      style={{
        ['--sidebar-width' as any]: '280px',
        ['--header-height' as any]: '56px',
      }}
    >
    <SidebarInset>
    <div className="min-h-screen bg-background text-foreground">
      {/* Brand bar */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-2 flex items-center justify-between">
          {/* Navsunli brand logo - centered on mobile, left on desktop */}
          <div className="flex-1 flex justify-center md:justify-start">
            <img src={BrandLogo} alt="Navsunli" className="brand-logo w-auto" />
          </div>
          {/* NS Pharma logo - hidden on mobile, right on desktop */}
          <div className="hidden md:flex items-center">
            <img src={NsPharmaLogo} alt="NS Pharma" className="h-6 w-auto" />
          </div>
        </div>
      </header>
      
      {/* Mobile Content Menu Button - shows when content is active on mobile */}
      {isContentActive && (
        <div className="md:hidden px-4 py-2">
          <button
            className="mobile-content-menu-btn"
            onClick={() => setMobileContentDrawerOpen(true)}
            aria-label="Open content menu"
          >
            <List size={20} weight="bold" />
          </button>
        </div>
      )}
      
      {/* Mobile Content Drawer */}
      <div className={`mobile-content-drawer-overlay ${mobileContentDrawerOpen ? 'open' : ''}`} onClick={() => setMobileContentDrawerOpen(false)} />
      <div className={`mobile-content-drawer ${mobileContentDrawerOpen ? 'open' : ''}`}>
        <div className="mobile-content-drawer-header">
          <span className="mobile-content-drawer-title">Content</span>
          <button
            className="mobile-content-drawer-close"
            onClick={() => setMobileContentDrawerOpen(false)}
            aria-label="Close content menu"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mobile-content-drawer-nav">
          <ul>
            {sections.map(sec => {
              const isActive = activeId === sec.id
              const hasActiveChild = !!sec.subsections?.some(sub => sub.id === activeId)
              const hasSubs = !!(sec.subsections && sec.subsections.length > 0)
              const isExpanded = expandedSections.has(sec.id)
              
              return (
                <li key={sec.id}>
                  <button
                    className={`mobile-content-drawer-item ${isActive || hasActiveChild ? 'active' : ''}`}
                    onClick={() => {
                      if (hasSubs) {
                        setExpandedSections(prev => {
                          const next = new Set(prev)
                          if (next.has(sec.id)) {
                            next.delete(sec.id)
                          } else {
                            next.add(sec.id)
                          }
                          return next
                        })
                      }
                      setActiveId(sec.id)
                      document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      history.replaceState(null, '', `#${sec.id}`)
                      if (!hasSubs) {
                        setMobileContentDrawerOpen(false)
                      }
                    }}
                  >
                    <span>{sectionNumber(sec.id)}. {sec.title}</span>
                    {hasSubs && <ChevronDown size={16} className={isExpanded ? 'rotate-180' : ''} />}
                  </button>
                  
                  {hasSubs && isExpanded && (
                    <ul className="mobile-content-drawer-subsections">
                      {sec.subsections!.map(sub => {
                        const isSubActive = activeId === sub.id
                        return (
                          <li key={sub.id}>
                            <button
                              className={`mobile-content-drawer-subitem ${isSubActive ? 'active' : ''}`}
                              onClick={() => {
                                setActiveId(sub.id)
                                document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                history.replaceState(null, '', `#${sub.id}`)
                                setMobileContentDrawerOpen(false)
                              }}
                            >
                              {subNumber(sec.id, sub.id)}. {sub.title}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      
      <main className="mx-auto max-w-[1400px] flex gap-6 px-2 sm:px-4 py-4">
        {/* Fluid Connected Sidebar */}
        <aside className="hidden md:block fluid-sidebar">
          <div className={`fluid-sidebar-wrapper ${showContentNav ? 'connected' : ''}`}>
            {/* Main Navigation Panel */}
            <nav className="fluid-nav-main">
              <div className="fluid-nav-main-inner">
                <ul>
                  <li>
                    <button
                      className={`fluid-nav-item ${activeId === 'overview' ? 'active' : ''}`}
                      onClick={() => goToId('overview')}
                      title="Overview"
                    >
                      <House size={22} weight="bold" />
                      <span className="fluid-nav-item-label">Overview</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`fluid-nav-item ${isContentActive ? 'active' : ''}`}
                      onClick={() => {
                        setShowContentNav(true)
                        if (!isContentActive && sections.length > 0) {
                          goToId(sections[0].id)
                        }
                      }}
                      title="Content"
                    >
                      <BookOpen size={22} weight="bold" />
                      <span className="fluid-nav-item-label">Content</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`fluid-nav-item ${activeId === 'glossary' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveId('glossary')
                        document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        history.replaceState(null, '', '#glossary')
                      }}
                      title="Glossary"
                    >
                      <BookBookmark size={22} weight="bold" />
                      <span className="fluid-nav-item-label">Glossary</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`fluid-nav-item ${activeId === 'quiz' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveId('quiz')
                        document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        history.replaceState(null, '', '#quiz')
                      }}
                      title="Quiz"
                    >
                      <Exam size={22} weight="bold" />
                      <span className="fluid-nav-item-label">Quiz</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`fluid-nav-item ${activeId === 'blackbox' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveId('blackbox')
                        document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        history.replaceState(null, '', '#blackbox')
                      }}
                      title="Black Box"
                    >
                      <Square size={22} weight="bold" />
                      <span className="fluid-nav-item-label">Black Box</span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
            
            {/* Sub Navigation (Content sections) - attached to main nav */}
            {showContentNav && (
              <div className="fluid-nav-extended">
                <nav className="fluid-nav-sub">
                  <div className="fluid-nav-sub-header">Content</div>
                  <ul>
                    {sections.map(sec => {
                      const isActive = activeId === sec.id
                      const hasActiveChild = !!sec.subsections?.some(sub => sub.id === activeId)
                      const hasSubs = !!(sec.subsections && sec.subsections.length > 0)
                      const isExpanded = expandedSections.has(sec.id)
                      
                      return (
                        <li key={sec.id}>
                          <button
                            className={`fluid-nav-sub-item ${isActive || hasActiveChild ? 'active' : ''}`}
                            data-has-children={hasSubs}
                            data-expanded={isExpanded}
                            onClick={() => {
                              if (hasSubs) {
                                // Toggle expansion
                                setExpandedSections(prev => {
                                  const next = new Set(prev)
                                  if (next.has(sec.id)) {
                                    next.delete(sec.id)
                                  } else {
                                    next.add(sec.id)
                                  }
                                  return next
                                })
                              }
                              setActiveId(sec.id)
                              document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              history.replaceState(null, '', `#${sec.id}`)
                            }}
                          >
                            <span>{sectionNumber(sec.id)}. {sec.title}</span>
                            {hasSubs && <ChevronDown size={16} />}
                          </button>
                          
                          {/* Subsections */}
                          {hasSubs && isExpanded && (
                            <ul className="fluid-nav-subsections">
                              {sec.subsections!.map(sub => {
                                const isSubActive = activeId === sub.id
                                return (
                                  <li key={sub.id}>
                                    <button
                                      className={`fluid-nav-subsection-item ${isSubActive ? 'active' : ''}`}
                                      onClick={() => {
                                        setActiveId(sub.id)
                                        document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        history.replaceState(null, '', `#${sub.id}`)
                                      }}
                                    >
                                      {subNumber(sec.id, sub.id)}. {sub.title}
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </aside>
        {/* Main Content Reader */}
        <section className="flex-1 min-w-0 space-y-6" id="reader-top">
          {activeId === 'overview' ? (
            <Overview
              error={error}
              overviewSections={content?.overviewSections}
              overviewBlackBoxHtml={content?.overviewBlackBoxHtml}
              productOverview={content?.product?.overview}
              onRefClick={goToId}
              refNumber={refNumber}
            />
          ) : activeId === 'glossary' ? (
            <Glossary
              query={glossaryQuery}
              setQuery={setGlossaryQuery}
              items={filteredGlossary}
            />
          ) : activeId === 'quiz' ? (
            <Quiz
              quiz={content?.quiz}
              productName={content?.product?.name}
            />
          ) : activeId === 'blackbox' ? (
            <BlackBox
              html={content?.overviewBlackBoxHtml}
              productName={content?.product?.name}
            />
          ) : (
            // Section or Subsection rendering
            <Tabs value={activeId || undefined} className="w-full">
              {sections.map(sec => (
                <TabsContent key={sec.id} value={sec.id} id={sec.id}>
                  <div>
                    <ExternalBody
                      url={sec.bodyUrl || `${getContentBase()}/products/${content?.product.id}/blocks/${sec.id}.html`}
                      format="html"
                    />
                  </div>
                </TabsContent>
              ))}
              {/* If activeId is a subsection id, render it standalone */}
              {sections.map(sec => (
                sec.subsections?.map(sub => (
                  <TabsContent key={sub.id} value={sub.id} id={sub.id}>
                    <div>
                      {sub.bodyUrl ? (
                        <ExternalBody url={sub.bodyUrl} format={sub.bodyFormat} />
                      ) : (
                        <SectionBody text={sub.bodyMd} />
                      )}
                    </div>
                  </TabsContent>
                )) || null
              ))}
            </Tabs>
          )}
        </section>
        {/* no right sidebar; glossary renders in reader when selected */}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav md:hidden">
        <div className="mobile-bottom-nav-inner">
          <div className="mobile-nav-items">
            <button
              className={`mobile-nav-item ${activeId === 'overview' ? 'active' : ''}`}
              onClick={() => goToId('overview')}
            >
              <House size={24} weight="bold" />
              <span>Overview</span>
            </button>
            <button
              className={`mobile-nav-item ${isContentActive ? 'active' : ''}`}
              onClick={() => {
                setShowContentNav(true)
                if (!isContentActive && sections.length > 0) {
                  goToId(sections[0].id)
                }
              }}
            >
              <BookOpen size={24} weight="bold" />
              <span>Content</span>
            </button>
            <button
              className={`mobile-nav-item ${activeId === 'glossary' ? 'active' : ''}`}
              onClick={() => {
                setActiveId('glossary')
                document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                history.replaceState(null, '', '#glossary')
              }}
            >
              <BookBookmark size={24} weight="bold" />
              <span>Glossary</span>
            </button>
            <button
              className={`mobile-nav-item ${activeId === 'quiz' ? 'active' : ''}`}
              onClick={() => {
                setActiveId('quiz')
                document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                history.replaceState(null, '', '#quiz')
              }}
            >
              <Exam size={24} weight="bold" />
              <span>Quiz</span>
            </button>
            <button
              className={`mobile-nav-item ${activeId === 'blackbox' ? 'active' : ''}`}
              onClick={() => {
                setActiveId('blackbox')
                document.getElementById('reader-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                history.replaceState(null, '', '#blackbox')
              }}
            >
              <Square size={24} weight="bold" />
              <span>Black Box</span>
            </button>
          </div>
          <div className="mobile-nav-logo">
            <img src={NsPharmaLogo} alt="NS Pharma" className="h-6 w-auto" />
          </div>
        </div>
      </nav>
    </div>
    </SidebarInset>
    </SidebarProvider>
  )
}

export default App