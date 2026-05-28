import type { SharePayload } from 'expo-sharing';
import { inferMediaType } from './mediaMetadata';
import type { Media } from './types';

export type NormalizedSharedUrl = {
  originalUrl: string;
  url: string;
  type: Media['type'];
};

export type SharedUrlChoice = NormalizedSharedUrl & {
  id: string;
};

const trailingPunctuation = /[),.;:!?]+$/;
const leadingPunctuation = /^[([<{]+/;
const urlPattern = /((?:https?:\/\/|www\.)[^\s<>"']+|(?:youtu\.be|youtube\.com|m\.youtube\.com|instagram\.com|www\.instagram\.com|patreon\.com|www\.patreon\.com)\/[^\s<>"']+)/gi;
const trackingParams = new Set([
  'fbclid',
  'gclid',
  'igsh',
  'igshid',
  'mc_cid',
  'mc_eid',
  'si',
]);

export function normalizeSharedPayloads(payloads: SharePayload[]): SharedUrlChoice[] {
  return uniqueUrls(
    payloads.flatMap((payload) => {
      if (!payload.value.trim()) return [];

      if (payload.shareType === 'url') {
        return [payload.value, ...extractUrls(payload.value)];
      }

      if (payload.shareType === 'text') {
        return extractUrls(payload.value);
      }

      return [];
    }),
  )
    .map((url, index) => {
      const normalized = normalizeSharedUrl(url);
      if (!normalized) return null;
      return { ...normalized, id: `${index}-${normalized.url}` };
    })
    .filter((value): value is SharedUrlChoice => Boolean(value));
}

export function extractUrls(input: string): string[] {
  return uniqueUrls(
    Array.from(input.matchAll(urlPattern))
      .map((match) => cleanUrlCandidate(match[0]))
      .filter(Boolean),
  );
}

export function normalizeSharedUrl(input: string): NormalizedSharedUrl | null {
  const originalUrl = cleanUrlCandidate(input);
  if (!originalUrl) return null;

  const candidate = withScheme(originalUrl);

  try {
    const parsed = new URL(candidate);
    parsed.protocol = 'https:';
    parsed.hash = '';
    stripTrackingParams(parsed);

    const youtubeUrl = normalizeYoutubeUrl(parsed);
    const normalizedUrl = youtubeUrl ?? normalizeGenericUrl(parsed);

    return {
      originalUrl,
      url: normalizedUrl,
      type: inferMediaType(normalizedUrl),
    };
  } catch {
    return null;
  }
}

function normalizeYoutubeUrl(url: URL) {
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const timestamp = url.searchParams.get('t') || url.searchParams.get('start');

  if (hostname === 'youtu.be') {
    const videoId = url.pathname.split('/').filter(Boolean)[0];
    if (!videoId) return null;

    const normalized = new URL('https://www.youtube.com/watch');
    normalized.searchParams.set('v', videoId);
    if (timestamp) normalized.searchParams.set('t', timestamp);
    return normalized.toString();
  }

  if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
    const videoId = url.searchParams.get('v') || youtubeIdFromPath(url.pathname);
    if (!videoId) return normalizeGenericUrl(url);

    const normalized = new URL('https://www.youtube.com/watch');
    normalized.searchParams.set('v', videoId);
    if (timestamp) normalized.searchParams.set('t', timestamp);
    return normalized.toString();
  }

  return null;
}

function youtubeIdFromPath(pathname: string) {
  const [kind, id] = pathname.split('/').filter(Boolean);
  return kind === 'shorts' || kind === 'embed' ? id : undefined;
}

function normalizeGenericUrl(url: URL) {
  url.hostname = url.hostname.toLowerCase();
  if (url.hostname.startsWith('m.youtube.com')) url.hostname = 'www.youtube.com';
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString();
}

function stripTrackingParams(url: URL) {
  Array.from(url.searchParams.keys()).forEach((key) => {
    if (key.startsWith('utm_') || trackingParams.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  });
}

function withScheme(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function cleanUrlCandidate(value: string) {
  return value.trim().replace(leadingPunctuation, '').replace(trailingPunctuation, '');
}

function uniqueUrls(urls: string[]) {
  const seen = new Set<string>();

  return urls.filter((url) => {
    const key = url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
