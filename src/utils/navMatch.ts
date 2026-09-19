const HOME_PATHS = ['/learn', '/unit', '/review'];

export function isNavActive(pathname: string, to: string): boolean {
  const matches = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  return to === '/learn' ? HOME_PATHS.some(matches) : matches(to);
}
