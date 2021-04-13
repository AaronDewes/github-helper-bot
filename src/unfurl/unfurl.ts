import unfurlToAttachment from './unfurl-to-attachment';
import attachments from 'probot-attachments';
import getLinks from './get-links';
import {Context} from 'probot';

export default async function unfurl (context: Context, html: string) {
  const links = getLinks(html);

  if (links.length > 0) {
    const unfurls = await Promise.all(links.map(link => unfurlToAttachment(link)));
    unfurls.forEach((unfurl => {
        return attachments(context).add(unfurl);
    }));
  }
}
