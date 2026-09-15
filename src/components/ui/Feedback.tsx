import type { ReactNode } from 'react';

export const OH_NON = 'Oh non !';

export function OhNon({ children }: { children: ReactNode }) {
  return (
    <div className="ohnon" role="status">
      <p className="ohnon__cry" lang="fr">
        {OH_NON}
      </p>
      <div className="ohnon__msg">{children}</div>
    </div>
  );
}

export function Correct({ title = 'Correct', children }: { title?: ReactNode; children?: ReactNode }) {
  return (
    <div className="ohnon ohnon--go" role="status">
      <p className="ohnon__cry">{title}</p>
      {children && <div className="ohnon__msg">{children}</div>}
    </div>
  );
}
