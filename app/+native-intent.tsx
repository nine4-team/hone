export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    const url = new URL(path, 'hitlist://app');

    if (url.hostname === 'expo-sharing' || url.pathname === '/expo-sharing') {
      return '/share-intake';
    }

    return path;
  } catch {
    return path;
  }
}
