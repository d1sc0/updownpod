import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const episodes = await getCollection('episodes', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  episodes.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Upstairs Downstairs Podcast',
    description: 'Insert description here',
    site: context.site,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
    items: episodes.map(episode => ({
      title: episode.data.title,
      pubDate: episode.data.pubDate,
      description: `${episode.data.description}`,
      link: `/episodes/${episode.slug}/`,
      content: `<p>${episode.data.description} <a href="${context.site}episodes/${episode.slug}/">[read more...]</a></p>
      <p><img src="https://hellostu.xyz${episode.data.socialImage}" width="600px" height="300px" /></p>`,
    })),
  });
}
