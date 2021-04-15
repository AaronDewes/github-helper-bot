import { JSDOM } from 'jsdom';

export default function getLinks(html: string): string[] {
    const links: string[] = [];

    // Parse the HTML
    const frag = JSDOM.fragment(html);

    // Check if the content came from an email
    const isEmail = !!frag.querySelectorAll('.email-fragment').length;

    if (!isEmail) {
        // Find all the links
        frag.querySelectorAll('a').forEach((a) => {
            // Only unfurl raw links. GitHub also adds a trailing `/`
            if (a.href === a.innerHTML || a.href === `${a.innerHTML}/`) {
                links.push(a.href);
            }
        });
    }

    // Avoid duplicate identical links
    return Array.from(new Set(links));
}
