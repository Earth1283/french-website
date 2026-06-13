import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBackdrop, type Backdrop as BackdropData } from '../../services/unsplash';

/**
 * Full-bleed ambient background for Landing / Focus. Paints the gradient skin
 * immediately, then fades in the Unsplash photo once it loads (or stays on the
 * gradient if there's no key / no network). A dark scrim keeps white text legible.
 */
export function Backdrop() {
  const [data, setData] = useState<BackdropData | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    getBackdrop().then(d => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  const night = data?.night ?? false;
  const gradient = data?.gradient;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Gradient skin — always present, shows instantly and underneath the photo */}
      <div
        className="absolute inset-0"
        style={{ background: gradient ?? 'radial-gradient(120% 120% at 50% 0%, #2a2350, #0d0d24)' }}
      />

      {/* Photo, fades in over the gradient once decoded */}
      <AnimatePresence>
        {data?.imageUrl && (
          <motion.img
            key={data.imageUrl}
            src={data.imageUrl}
            alt=""
            onLoad={() => setImgLoaded(true)}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 1.06 }}
            transition={{ opacity: { duration: 1.1, ease: 'easeOut' }, scale: { duration: 12, ease: 'easeOut' } }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>

      {/* Scrim — darker at top & bottom so the clock and footer text stay readable */}
      <div
        className="absolute inset-0"
        style={{
          background: night
            ? 'linear-gradient(180deg, rgba(5,5,16,0.55) 0%, rgba(5,5,16,0.25) 40%, rgba(5,5,16,0.6) 100%)'
            : 'linear-gradient(180deg, rgba(10,10,20,0.45) 0%, rgba(10,10,20,0.2) 38%, rgba(10,10,20,0.62) 100%)',
        }}
      />

      {/* Attribution — required by the Unsplash API guidelines */}
      {data?.attribution && (
        <div className="absolute bottom-3 left-4 text-[0.66rem] text-white/55">
          Photo by{' '}
          <a
            href={data.attribution.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/30 hover:text-white/80"
          >
            {data.attribution.name}
          </a>{' '}
          on{' '}
          <a
            href={data.attribution.photoUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/30 hover:text-white/80"
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
}
