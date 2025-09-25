export function imageUrl(picture) {
  if (!picture) return '';
  // If absolute URL already
  if (/^https?:\/\//i.test(picture)) return picture;
  // Normalize path under /uploads
  const suffix = picture.includes('uploads') ? picture.split('uploads').pop() : `/${picture}`;
  try {
    const origin = window.location.origin;
    if (origin.includes('-3000.')) return origin.replace('-3000.', '-5000.') + '/uploads' + suffix;
    if (origin.includes('-3001.')) return origin.replace('-3001.', '-5000.') + '/uploads' + suffix;
    if (origin.includes('-3002.')) return origin.replace('-3002.', '-5000.') + '/uploads' + suffix;
  } catch (_) {}
  const env = process.env.REACT_APP_BACKEND_URL;
  if (env) return env.replace(/\/$/, '') + '/uploads' + suffix;
  return '/uploads' + suffix;
}
