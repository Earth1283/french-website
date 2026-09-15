import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface BoardProps {
  title: ReactNode;
  gloss?: ReactNode;
  aside?: ReactNode;
  lead?: ReactNode;
  lang?: string;
  titleId?: string;
  titleAs?: 'h1' | 'h2';
  className?: string;
  children?: ReactNode;
}

export function Board({ title, gloss, aside, lead, lang, titleId, titleAs: Title = 'h2', className, children }: BoardProps) {
  return (
    <section className={className ? `board ${className}` : 'board'} aria-labelledby={titleId}>
      {lead}
      <header className="board__head">
        <Title className="board__title" id={titleId}>
          <span lang={lang}>{title}</span>
          {gloss && <span className="board__title-en">{gloss}</span>}
        </Title>
        {aside}
      </header>
      {children}
    </section>
  );
}

interface BoardRowProps {
  glyph: ReactNode;
  dest: ReactNode;
  via?: ReactNode;
  status?: ReactNode;
  now?: boolean;
  to?: string;
  onClick?: () => void;
}

export function BoardRow({ glyph, dest, via, status, now = false, to, onClick }: BoardRowProps) {
  const content = (
    <>
      <span className="grid place-items-center">{glyph}</span>
      <span className="min-w-0">
        <span className="board__dest block">{dest}</span>
        {via && <span className="board__via block">{via}</span>}
      </span>
      {status && <span className={now ? 'board__status board__status--now' : 'board__status'}>{status}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="board__row">
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="board__row">
        {content}
      </button>
    );
  }
  return <div className="board__row">{content}</div>;
}

export function BoardGlyph({ children }: { children: ReactNode }) {
  return (
    <span className="board__glyph" aria-hidden="true">
      {children}
    </span>
  );
}
