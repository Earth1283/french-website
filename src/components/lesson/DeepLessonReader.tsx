import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MarkdownPage } from '../../utils/markdownPage';

interface DeepLessonReaderProps {
  pages: MarkdownPage[];
  pageIndex: number;
  onPageChange: (index: number) => void;
  onComplete: () => void;
  completeLabel?: string;
}

const WORDS_PER_MINUTE = 200;

function readingMinutes(pages: MarkdownPage[]): number {
  const words = pages.reduce((sum, page) => sum + page.body.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function DeepLessonReader({ pages, pageIndex, onPageChange, onComplete, completeLabel = 'Continue' }: DeepLessonReaderProps) {
  const [minutes] = useState(() => readingMinutes(pages));
  const page = pages[pageIndex];
  const isLast = pageIndex === pages.length - 1;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pageIndex]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (event.key === 'ArrowRight' && pageIndex < pages.length - 1) {
        event.preventDefault();
        onPageChange(pageIndex + 1);
      } else if (event.key === 'ArrowLeft' && pageIndex > 0) {
        event.preventDefault();
        onPageChange(pageIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pageIndex, pages.length, onPageChange]);

  return (
    <div className="page">
      <div className="reader-meta">
        <span className="stations" role="img" aria-label={`Page ${pageIndex + 1} of ${pages.length}`}>
          {pages.map((_, index) => (
            <i key={index} className={index < pageIndex ? 'done' : index === pageIndex ? 'here' : undefined} />
          ))}
        </span>
        <span className="t-small num">{minutes} min read</span>
      </div>

      <article className={pageIndex === 0 ? 'prose-reading drop-cap' : 'prose-reading'}>
        {page.title && <h1>{page.title}</h1>}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ children }) => (
              <div className="table-scroll">
                <table>{children}</table>
              </div>
            ),
          }}
        >
          {page.body}
        </ReactMarkdown>
      </article>

      <div className="reader-nav">
        <Button variant="secondary" onClick={() => onPageChange(pageIndex - 1)} disabled={pageIndex === 0}>
          <ChevronLeft size={20} aria-hidden="true" />
          Previous
        </Button>
        {isLast ? (
          <Button onClick={onComplete}>{completeLabel}</Button>
        ) : (
          <Button onClick={() => onPageChange(pageIndex + 1)}>
            Next page
            <ChevronRight size={20} aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
