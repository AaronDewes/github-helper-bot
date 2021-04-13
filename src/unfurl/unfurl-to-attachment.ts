import { unfurl } from 'unfurl.js';

type attachments = {
    pretext?: string
    author_name?: string
    author_icon?: string
    title?: string
    title_link?: string
    text?: string
    image_url?: string
    thumb_url?: string
    footer?: string
    footer_icon?: string
}

export default async function unfurlToAttachment (url: string): Promise<attachments> {
  const data = await unfurl(url);

  const description = data.open_graph.description || data.twitter_card.description;
  const authorName = data.oEmbed?.author_name;
  const title = data.open_graph.title.trim() || data.twitter_card.title?.trim();
  const titleLink =  data.open_graph.url || url
  const thumbUrl = (data.open_graph.images && data.open_graph.images[0]?.url);

  return {
    author_name: authorName,
    title: title,
    title_link: titleLink,
    text: description,
    thumb_url: thumbUrl
  }
}
