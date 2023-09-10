import { uniqueId } from 'lodash';

function parseData(data) {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/xml');
  const errorNode = document.querySelector('parsererror');
  if (errorNode) {
    const errorMessages = Array.from(errorNode.querySelectorAll('div')).map((divNode) => divNode.textContent).join('\n');
    const parseError = new Error(errorMessages);
    parseError.code = 'parseError';
    throw parseError;
  }
  try {
    const rssElement = document.querySelector('rss');
    const rssVersion = rssElement.getAttribute('version');
    const feedStateId = uniqueId('feed');

    const channelElement = rssElement.querySelector(':scope > channel');

    const channelTitle = channelElement.querySelector(':scope > title').textContent;
    const channelLink = channelElement.querySelector(':scope > link').textContent;
    const channelDescription = channelElement.querySelector(':scope > description').textContent;

    const postElements = Array.from(channelElement.querySelectorAll(':scope > item'));
    const parsedPosts = postElements.map((post) => ({
      id: uniqueId('post'),
      parentFeedId: feedStateId,
      link: post.querySelector(':scope > link').textContent,
      title: post.querySelector(':scope > title').textContent,
      description: post.querySelector(':scope > description').textContent,
    }));

    const parsedFeedMeta = {
      id: feedStateId,
      rssVersion,
      title: channelTitle,
      link: channelLink,
      description: channelDescription,
    };
    return [parsedFeedMeta, parsedPosts];
  } catch (err) {
    const parseError = new Error(`Data is an XML document but not an RSS feed. ${err.message}`);
    parseError.code = 'parseError';
    throw parseError;
  }
}

export default parseData;
