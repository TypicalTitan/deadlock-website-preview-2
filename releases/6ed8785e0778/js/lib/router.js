// Hash routes ("#/teams/abc"): GitHub Pages only ever serves index.html, so a refresh never 404s.
import { useEffect, useState } from 'preact/hooks';

function currentPath() {
  const raw = location.hash.replace(/^#/, '') || '/';
  let path;
  try {
    path = decodeURI(raw);
  } catch {
    path = raw;
  }
  return path.length > 1 ? path.replace(/\/$/, '') : path; // "/rules/" is "/rules"
}

export function useRoute() {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const update = () => setPath(currentPath());
    addEventListener('hashchange', update);
    return () => removeEventListener('hashchange', update);
  }, []);
  return path;
}

// match('/teams/:id', '/teams/abc') -> { id: 'abc' }; null when the path doesn't fit the pattern.
export function match(pattern, path) {
  const want = pattern.split('/');
  const got = path.split('/');
  if (want.length !== got.length) return null;
  const params = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) params[want[i].slice(1)] = got[i];
    else if (want[i] !== got[i]) return null;
  }
  return params;
}
