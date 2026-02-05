import { HtmlText } from '@/components/HtmlText'

type OverviewSection = { title: string; content?: string; bullets?: Array<{ text: string; refs?: string[] }> }

type OverviewProps = {
  error: string | null
  overviewSections?: OverviewSection[]
  overviewBlackBoxHtml?: string
  productOverview?: string
  onRefClick: (id: string) => void
  refNumber: (id: string) => string
}

export function Overview({
  error,
  overviewSections,
  overviewBlackBoxHtml: _overviewBlackBoxHtml,
  productOverview,
  onRefClick,
  refNumber,
}: OverviewProps) {
  // Note: overviewBlackBoxHtml is passed but displayed in separate BlackBox component
  void _overviewBlackBoxHtml
  const intro = overviewSections && overviewSections.length > 0 && overviewSections[0]?.content ? { title: overviewSections[0].title, content: overviewSections[0].content } : null
  const rest = overviewSections ? (intro ? overviewSections.slice(1) : overviewSections) : []
  return (
    <div id="overview">
      {intro && (
        <div>
          <h1>{intro.title}</h1>
          <HtmlText html={intro.content} />
        </div>
      )}
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          {rest && rest.length > 0 ? (
            <div>
              {rest.map((sec) => (
                <div key={sec.title}>
                  <h2>{sec.title}</h2>
                  {'bullets' in sec && sec.bullets && (
                    <ul>
                      {sec.bullets.map((b, idx) => (
                        <li key={idx}>
                          <HtmlText html={b.text} />
                          {b.refs && b.refs.length > 0 && (
                            <span>
                              {b.refs.map((id) => (
                                <a
                                  key={id}
                                  className="internal-link"
                                  href={`#${id}`}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    onRefClick(id)
                                  }}
                                >
                                  {refNumber(id)}
                                </a>
                              ))}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              
            </div>
          ) : (
            <p>
              {productOverview || 'Loading content…'}
            </p>
          )}
        </>
      )}
    </div>
  )
}

