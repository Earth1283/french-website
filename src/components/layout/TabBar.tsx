import { Link, useLocation } from 'react-router-dom';
import { useClassroomStore } from '../../stores/classroomStore';
import { isTabActive, tabsFor } from './navigation';

export function TabBar() {
  const { pathname } = useLocation();
  const role = useClassroomStore(s => s.role);

  return (
    <nav className="tabbar" aria-label="Main">
      {tabsFor(role).map(tab => (
        <Link key={tab.to} to={tab.to} aria-current={isTabActive(tab, pathname) ? 'page' : undefined}>
          <tab.icon size={20} aria-hidden="true" />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
