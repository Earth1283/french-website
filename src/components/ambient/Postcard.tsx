import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { getBackdrop } from '../../services/unsplash';
import type { Backdrop } from '../../services/unsplash';
import { speak } from '../../utils/speech';
import { frenchPunctuation } from '../../utils/french';
import type { VocabItem } from '../../types';

const pad = (value: number) => value.toString().padStart(2, '0');

interface PostcardProps {
  phrase: VocabItem;
  label: string;
  now: Date;
}

export function Postcard({ phrase, label, now }: PostcardProps) {
  const [backdrop, setBackdrop] = useState<Backdrop | null>(null);

  useEffect(() => {
    let alive = true;
    getBackdrop().then(result => {
      if (alive) setBackdrop(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  const postmarkDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${pad(now.getFullYear() % 100)}`;

  return (
    <article className="postcard" aria-labelledby="postcard-phrase">
      <div className={backdrop?.night ? 'postcard__photo postcard__photo--night' : 'postcard__photo'}>
        {backdrop?.imageUrl && <img src={backdrop.imageUrl} alt="" />}
        {backdrop?.attribution && (
          <span className="postcard__credit">
            Photo by{' '}
            <a href={backdrop.attribution.profileUrl} target="_blank" rel="noreferrer">
              {backdrop.attribution.name}
            </a>{' '}
            on{' '}
            <a href={backdrop.attribution.photoUrl} target="_blank" rel="noreferrer">
              Unsplash
            </a>
          </span>
        )}
      </div>
      <div className="postcard__back">
        <div className="stamp" aria-hidden="true">
          <span>!</span>
        </div>
        <div className="postmark num" aria-hidden="true">
          Paris
          <br />
          {postmarkDate}
        </div>
        <p className="postcard__label" lang="fr">
          {label}
        </p>
        <p className="postcard__phrase" id="postcard-phrase" lang="fr">
          {frenchPunctuation(phrase.french)}
        </p>
        <p className="postcard__en">{phrase.english}</p>
        <div className="postcard__say-row">
          <button type="button" className="say" onClick={() => speak(phrase.french)} aria-label={`Hear ${phrase.french}`}>
            <Volume2 size={20} aria-hidden="true" />
          </button>
          <span className="postcard__say">{phrase.pronunciation}</span>
        </div>
      </div>
    </article>
  );
}
