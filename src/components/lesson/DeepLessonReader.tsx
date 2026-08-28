import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { MarkdownPage } from '../../utils/markdownPage';

interface DeepLessonReaderProps {
  pages: MarkdownPage[];
  accentColor?: string;
  onComplete: () => void;
  completeLabel?: string;
}

function readingMinutes(pages: MarkdownPage[]): number {
  const words = pages.reduce((sum, p) => sum + p.body.split(/\s+/).filter(Boolean).length, 0);
  return Math.max(1, Math.round(words / 200));
}

export function DeepLessonReader({ pages, accentColor, onComplete, completeLabel = 'Continue' }: DeepLessonReaderProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const accent = accentColor ?? 'var(--accent)';
  const page = pages[pageIndex];
  const isLast = pageIndex === pages.length - 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && pageIndex < pages.length - 1) {
        e.preventDefault();
        setPageIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && pageIndex > 0) {
        e.preventDefault();
        setPageIndex((i) => i - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pageIndex, pages.length]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <span className="chip">
          <BookOpen size={12} /> {readingMinutes(pages)} min read
        </span>
        <div className="flex items-center gap-1.5" aria-label={`Page ${pageIndex + 1} of ${pages.length}`}>
          {pages.map((_, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: i === pageIndex ? 18 : 6,
                height: 6,
                backgroundColor: i <= pageIndex ? accent : 'var(--border)',
                transition: 'width 0.3s cubic-bezier(0.34, 1.3, 0.64, 1), background-color 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pageIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        >
          {page.title && (
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
              {page.title}
            </h2>
          )}
          <div className={`prose-reading ${pageIndex === 0 ? 'drop-cap' : ''}`}>
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
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8 max-w-[64ch] mx-auto">
        <Button variant="secondary" onClick={() => setPageIndex((i) => i - 1)} disabled={pageIndex === 0}>
          <ChevronLeft size={16} /> Prev
        </Button>
        {isLast ? (
          <Button onClick={onComplete}>
            {completeLabel} <ArrowRight size={16} />
          </Button>
        ) : (
          <Button onClick={() => setPageIndex((i) => i + 1)}>
            Next <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
