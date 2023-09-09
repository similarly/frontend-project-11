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

    const channelElement = rssElement.querySelector(':scope > channel');

    const channelTitle = channelElement.querySelector(':scope > title').textContent;
    const channelLink = channelElement.querySelector(':scope > link').textContent;
    const channelDescription = channelElement.querySelector(':scope > description').textContent;

    const itemElements = Array.from(channelElement.querySelectorAll(':scope > item'));
    const items = itemElements.map((item) => ({
      link: item.querySelector(':scope > link').textContent,
      title: item.querySelector(':scope > title').textContent,
      description: item.querySelector(':scope > description').textContent,
    }));

    const parsedFeed = {
      rssVersion,
      feedInfo: {
        title: channelTitle,
        link: channelLink,
        description: channelDescription,
      },
      items,
    };
    return parsedFeed;
  } catch (err) {
    const parseError = new Error(`Data is an XML document but not an RSS feed. ${err.message}`);
    parseError.code = 'parseError';
    throw parseError;
  }
}

export default parseData;
