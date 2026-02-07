export function setFavicon(theme: 'light' | 'dark') {
  const link = document.getElementById('favicon') as HTMLLinkElement | null;
  if (!link) return;

  link.href =
    theme === 'dark'
      ? `/favicon-dark.ico?v=${Date.now()}`
      : `/favicon-light.ico?v=${Date.now()}`;
}
