export function extractIdFromUrl(url: string, prefix: string) {
  return url.slice(prefix.length)
}
