import type { APIRoute } from 'astro';
import { getAllPosts, getExcerpt, getPostUrl } from '../lib/posts';
import { SITE } from '../config';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async () => {
  const posts = (await getAllPosts()).slice(0, 10);
  const items = posts.map((post) => {
    const url = new URL(getPostUrl(post), SITE.url).toString();
    return `
      <item>
        <title>${escapeXml(post.data.title)}</title>
        <description>${escapeXml(getExcerpt(post.body ?? '', 300))}</description>
        <pubDate>${post.data.date.toUTCString()}</pubDate>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        ${post.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}
      </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <description>${escapeXml(SITE.description)}</description>
    <link>${SITE.url}/</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
