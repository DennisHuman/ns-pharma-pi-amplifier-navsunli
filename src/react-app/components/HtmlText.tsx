type HtmlTextProps = {
  html: string
  className?: string
  as?: 'span' | 'div'
}

export function HtmlText({ html, className, as = 'span' }: HtmlTextProps) {
  if (as === 'div') {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  }
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

