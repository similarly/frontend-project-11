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
  const rssElement = document.querySelector('rss');
  const rssVersion = rssElement.getAttribute('version');

  const channelElement = rssElement.querySelector(':scope > channel');

  const channelTitle = channelElement.querySelector(':scope > title').textContent;
  const channelLink = channelElement.querySelector(':scope > link').textContent;
  const channelDescription = channelElement.querySelector(':scope > description').textContent;

  const postElements = Array.from(channelElement.querySelectorAll(':scope > item'));
  const parsedPosts = postElements.map((post) => ({
    source: post.querySelector(':scope > link').textContent,
    title: post.querySelector(':scope > title').textContent,
    description: post.querySelector(':scope > description').textContent,
  }));

  const parsedFeedMeta = {
    rssVersion,
    title: channelTitle,
    source: channelLink,
    description: channelDescription,
  };
  return { parsedFeedMeta, parsedPosts };
}

export default parseData;
