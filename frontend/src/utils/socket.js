// Centralized WebSocket URL builder for Codespaces-friendly HMR/client sockets
// Some libraries assume ws(s)://host:port/ws; in Codespaces, port is encoded in subdomain.

export function getWsBase() {
  try {
    const loc = window.location;
    const isSecure = loc.protocol === 'https:';
    // For GitHub Codespaces, URLs look like https://<name>-3000.app.github.dev
    // WebSocket should be wss://<name>-3000.app.github.dev/ws (no :3000 suffix)
    const protocol = isSecure ? 'wss:' : 'ws:';
    return protocol + '//' + loc.host;
  } catch (_) {
    return 'ws://localhost:3000';
  }
}

export function makeSocketUrl(path = '/ws') {
  const base = getWsBase();
  return base + path;
}
