import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { HtmlText } from '@/components/HtmlText'

type SectionBodyProps = {
  text: string
}

export function SectionBody({ text }: SectionBodyProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (text || '').length > 600
  const preview = isLong ? text.slice(0, 600) + '…' : text
  return (
    <div className="space-y-2">
      <p>
        {expanded || !isLong ? <HtmlText html={text} /> : <HtmlText html={preview} />}
      </p>
      {isLong && (
        <Button variant="outline" size="sm" onClick={() => setExpanded(v => !v)}>
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  )
}

