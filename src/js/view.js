function render(state, lang) {
  const linkInput = document.querySelector('#link-form_input');
  const form = document.querySelector('#link-form');
  const currentFeedback = document.querySelector('.feedback');
  const button = document.querySelector('#link-form_button');
  const feedsTarget = document.querySelector('#feeds');
  const postsTarget = document.querySelector('#posts');

  const getFeedbackElement = (message) => {
    const feedback = document.createElement('div');
    feedback.classList.add('feedback', 'invalid-feedback', 'row');
    feedback.textContent = message;
    return feedback;
  };
  const getFeedElement = (feed) => {
    const feedsList = document.createElement('div');
    feedsList.classList.add('card', 'p-3');
    const title = document.createElement('h5');
    title.textContent = feed.data.feedInfo.title;
    const description = document.createElement('p');
    description.classList.add('text-muted');
    description.textContent = `Описание: ${feed.data.feedInfo.description}`;
    const link = document.createElement('p');
    link.textContent = `Источник: ${feed.data.feedInfo.link}`;
    const source = document.createElement('p');
    source.textContent = `URL фида: ${feed.url}`;
    source.classList.add('text-muted');
    feedsList.setAttribute('data-feed-url', link);
    feedsList.append(title, description, link, source);
    return feedsList;
  };
  const getPostsList = (feed) => {
    const feedTitle = document.createElement('h5');
    feedTitle.textContent = feed.data.feedInfo.title;
    const postsList = document.createElement('div');
    postsList.classList.add('flex-column', 'd-flex', 'p-3', 'gap-1');
    const posts = feed.data.items.map((item) => {
      const post = document.createElement('div');
      post.classList.add('card', 'p-3');
      const title = document.createElement('h5');
      title.textContent = item.title;
      const description = document.createElement('p');
      description.textContent = item.description;
      const link = document.createElement('a');
      link.classList.add('text-sm', 'text-secondary', 'post-link');
      link.textContent = item.link;
      link.setAttribute('href', item.link);
      post.setAttribute('data-feed-url', feed.data.feedInfo.link);
      post.append(title, link, description);
      return post;
    });
    postsList.replaceChildren(feedTitle, ...posts);
    return postsList;
  };

  // Render feeds and posts
  if (state.loadedFeeds.length) {
    // TODO: sort feeds by url and show them in the same order
    const feedList = state.loadedFeeds.map((feed) => {
      const feedElement = getFeedElement(feed);
      return feedElement;
    });
    const feedPostsList = state.loadedFeeds.map((feed) => {
      const postsElement = getPostsList(feed);
      return postsElement;
    });
    feedsTarget.replaceChildren(...feedList);
    postsTarget.replaceChildren(...feedPostsList);
  } else {
    feedsTarget.replaceChildren();
    postsTarget.replaceChildren();
  }

  // Feedback for submit button
  // TODO: add spinner
  if (state.formState === 'processing') {
    button.setAttribute('disabled', '');
  } else {
    button.removeAttribute('disabled');
  }

  // Input state style
  if (Object.values(state.errors).reduce((ac, cur) => ac || (cur !== false))) {
    linkInput.classList.add('is-invalid');
  } else {
    linkInput.classList.remove('is-invalid');
  }

  // TODO: add positive feedback
  // Set feedback
  if (currentFeedback) {
    currentFeedback.remove();
  }
  Object.entries(state.errors).forEach(([errorCode, isErrorThrown]) => {
    if (isErrorThrown) {
      const errorMessage = lang.t(`errors.${errorCode}`);
      const newFeedback = getFeedbackElement(errorMessage);
      form.append(newFeedback);
    }
  });
}

export default render;
