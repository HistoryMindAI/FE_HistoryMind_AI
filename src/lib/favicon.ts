const FAVICON_LIGHT = '/trong-dong.png';
const FAVICON_DARK = '/trong_dong_2.png';

export function setFavicon(theme: 'light' | 'dark') {
  const link = document.getElementById('favicon') as HTMLLinkElement | null;
  if (!link) return;

  const href = theme === 'dark' ? FAVICON_DARK : FAVICON_LIGHT;
  link.href = `${href}?v=${Date.now()}`;
}
