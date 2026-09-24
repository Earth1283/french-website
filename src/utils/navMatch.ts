const HOME_PATHS = ['/learn', '/unit', '/review'];
// DELF prep lives under the Test tab: placement and exam practice together.
const TEST_PATHS = ['/test', '/exam'];

export function isNavActive(pathname: string, to: string): boolean {
  const matches = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (to === '/learn') return HOME_PATHS.some(matches);
  if (to === '/test') return TEST_PATHS.some(matches);
  return matches(to);
}
