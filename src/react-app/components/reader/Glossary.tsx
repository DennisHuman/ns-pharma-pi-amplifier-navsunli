import { Input } from '@/components/ui/input'

type GlossaryItem = { term: string; definition: string }

type GlossaryProps = {
  query: string
  setQuery: (v: string) => void
  items: GlossaryItem[]
}

export function Glossary({ query, setQuery, items }: GlossaryProps) {
  return (
    <div id="glossary">
      <h2>Glossary</h2>
      <div>
        <Input
          placeholder="Search terms..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul>
          {items.map(item => (
            <li key={item.term}>
              <span>{item.term}</span> — {item.definition}
            </li>
          ))}
          {items.length === 0 && (
            <li>No matches</li>
          )}
        </ul>
      </div>
    </div>
  )
}

