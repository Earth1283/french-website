import type { Role } from '../types';
import { ROLES, roleColor } from '../roles';

export function RoleLegend({ roles }: { roles: Role[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted" aria-label="Color key">
      {roles.map(role => (
        <li key={role} className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: roleColor(role) }} />
          {ROLES[role].label}
        </li>
      ))}
    </ul>
  );
}
