import { type Quiz as QuizType } from '@/lib/content'

type QuizProps = {
  quiz?: QuizType
  productName?: string
}

export function Quiz({ quiz, productName }: QuizProps) {
  const hasQuestions = quiz && quiz.questions && quiz.questions.length > 0

  return (
    <div id="quiz">
      <p className="eyebrow">{productName || 'Product'} Knowledge Check</p>
      <h1>Quiz</h1>
      
      {hasQuestions ? (
        <div className="quiz-intro">
          <p className="lead">
            Test your understanding of the prescribing information for {productName || 'this product'}.
          </p>
          <p>
            This quiz contains <strong>{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</strong>. 
            You need to score at least <strong>{quiz.passPct}%</strong> to pass.
          </p>
          
          <div className="quiz-placeholder">
            <p className="text-muted-foreground">
              Quiz functionality coming soon. Questions will cover:
            </p>
            <ul>
              {quiz.questions.map((q, idx) => (
                <li key={q.id} className="text-muted-foreground">
                  Question {idx + 1}: {q.type === 'single' ? 'Single choice' : q.type === 'multiple' ? 'Multiple choice' : 'True/False'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">
          No quiz questions available for {productName || 'this product'} yet.
        </p>
      )}
    </div>
  )
}
