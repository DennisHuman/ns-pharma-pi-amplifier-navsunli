import { HtmlText } from '@/components/HtmlText'

type BlackBoxProps = {
  html?: string
  productName?: string
}

export function BlackBox({ html, productName }: BlackBoxProps) {
  return (
    <div id="blackbox">
      <p className="eyebrow">Important Safety Information</p>
      <h1>Black Box Warning</h1>
      
      {html && html.trim().length > 0 ? (
        <div className="blackbox-content">
          <HtmlText html={html} as="div" />
        </div>
      ) : (
        <p className="text-muted-foreground">
          No black box warning content available for {productName || 'this product'}.
        </p>
      )}
    </div>
  )
}
