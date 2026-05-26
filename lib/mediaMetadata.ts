import type { Media } from './types';

export type MediaMetadata = {
  title?: string;
  thumbnailUrl?: string;
};

export async function resolveMediaMetadata(url: string): Promise<MediaMetadata> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return {};

  const youtubeMetadata = await resolveYoutubeMetadata(trimmedUrl);
  if (youtubeMetadata.title || youtubeMetadata.thumbnailUrl) return youtubeMetadata;

  return resolveOpenGraphMetadata(trimmedUrl);
}

export function inferMediaType(url: string): Media['type'] {
  const normalized = url.toLowerCase();
  if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) return 'youtube';
  if (normalized.includes('instagram.com')) return 'instagram';
  return 'link';
}

async function resolveYoutubeMetadata(url: string): Promise<MediaMetadata> {
  if (inferMediaType(url) !== 'youtube') return {};

  try {
    const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint);
    if (!response.ok) return {};

    const payload = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
    };

    return {
      title: cleanMetadataText(payload.title),
      thumbnailUrl: payload.thumbnail_url,
    };
  } catch {
    return {};
  }
}

async function resolveOpenGraphMetadata(url: string): Promise<MediaMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    if (!response.ok) return {};

    const html = await response.text();

    return {
      title: cleanMetadataText(
        findMetaContent(html, 'og:title') ||
          findMetaContent(html, 'twitter:title') ||
          findTitleText(html),
      ),
      thumbnailUrl:
        findMetaContent(html, 'og:image') || findMetaContent(html, 'twitter:image') || undefined,
    };
  } catch {
    return {};
  }
}

function findMetaContent(html: string, key: string) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    const property = readAttribute(tag, 'property') || readAttribute(tag, 'name');
    if (property !== key) continue;

    const content = readAttribute(tag, 'content');
    if (content) return decodeHtmlEntities(content);
  }

  return undefined;
}

function findTitleText(html: string) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(stripTags(match[1])) : undefined;
}

function readAttribute(tag: string, attribute: string) {
  const match = tag.match(new RegExp(`${attribute}=["']([^"']*)["']`, 'i'));
  return match?.[1];
}

function cleanMetadataText(value?: string) {
  const cleaned = value?.replace(/\s+/g, ' ').trim();
  return cleaned || undefined;
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, '');
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#064;/g, '@')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
