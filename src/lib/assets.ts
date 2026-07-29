const externalUrlPattern = /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i;

export function assetUrl(path: string): string {
  if (externalUrlPattern.test(path)) {
    return path;
  }

  const cleanPath = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${cleanPath}`;
}
