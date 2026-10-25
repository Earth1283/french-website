import { filterBank } from '../../utils/classroomAttention';
import type { BankQuestion } from '../../types/classroom';

const TYPE_LABEL: Record<BankQuestion['type'], string> = {
  'multiple-choice': 'Multiple choice',
  'fill-blank': 'Fill in the blank',
  translation: 'Translation',
};

interface BankQuestionListProps {
  questions: BankQuestion[];
  search: string;
  onSearchChange: (search: string) => void;
  tag: string | null;
  onTagChange: (tag: string | null) => void;
  article?: string | null;
  onArticleChange?: (article: string | null) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  renderActions?: (question: BankQuestion) => React.ReactNode;
}

export function BankQuestionList({
  questions,
  search,
  onSearchChange,
  tag,
  onTagChange,
  article = null,
  onArticleChange,
  selected,
  onToggle,
  renderActions,
}: BankQuestionListProps) {
  const allTags = [...new Set(questions.flatMap((q) => q.tags))].sort();
  const articles = new Map(questions.filter((q) => q.readingId && q.readingTitle).map((q) => [q.readingId!, q.readingTitle!]));
  const visible = filterBank(questions, search, tag, article);

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search prompts and answers"
        aria-label="Search the question bank"
        className="ios-input py-2 text-sm"
      />
      {onArticleChange && articles.size > 0 && (
        <select
          value={article ?? ''}
          onChange={(e) => onArticleChange(e.target.value || null)}
          aria-label="Filter by article"
          className="ios-input py-1.5 text-sm"
        >
          <option value="">All questions</option>
          {[...articles].map(([id, title]) => (
            <option key={id} value={id}>
              From “{title}”
            </option>
          ))}
        </select>
      )}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => onTagChange(tag === t ? null : t)}
              aria-pressed={tag === t}
              className="chip cursor-pointer"
              style={{
                border: 'none',
                ...(tag === t ? { backgroundColor: 'var(--accent)', color: 'white' } : {}),
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="inset-group">
        {visible.length === 0 && (
          <p className="p-4 text-sm text-muted">
            {questions.length === 0 ? 'The bank is empty.' : 'Nothing matches that search.'}
          </p>
        )}
        {visible.map((q) => (
          <div key={q.id} className="inset-row items-start gap-3">
            <input
              type="checkbox"
              checked={selected.has(q.id)}
              onChange={() => onToggle(q.id)}
              aria-label={`Select: ${q.prompt}`}
              className="mt-1 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary">{q.prompt}</p>
              <p className="text-xs text-secondary">
                {q.answer}
                {q.options && <span className="text-muted"> · {q.options.join(' / ')}</span>}
              </p>
              <p className="text-xs text-muted">
                {TYPE_LABEL[q.type]}
                {q.readingTitle && ` · ${q.readingTitle}${q.page ? `, p. ${q.page}` : ''}`}
                {q.tags.length > 0 && ` · ${q.tags.join(', ')}`}
              </p>
            </div>
            {renderActions?.(q)}
          </div>
        ))}
      </div>
    </div>
  );
}
