import { find } from 'lodash';

function render(state, lang) {
  const linkInput = document.querySelector('#link-form_input');
  const form = document.querySelector('#link-form');
  const currentFeedback = document.querySelector('.feedback');
  const button = document.querySelector('#link-form_button');
  const feedsTarget = document.querySelector('#feeds');
  const postsTarget = document.querySelector('#posts');
  // TODO: add bootstrap tooltip 'no posts for this feed' if hovered feed has no posts
  const toggleActive = (e) => {
    const { feedId } = e.target.dataset;
    const targetPosts = document.querySelectorAll(`.post[data-feed-id="${feedId}"]`);
    const targetFeed = document.querySelector(`.feed[data-feed-id="${feedId}"]`);
    targetPosts.forEach((post) => post.classList.toggle('active'));
    targetFeed.classList.toggle('active');
  };
  const getFeedbackElement = (message) => {
    const feedback = document.createElement('div');
    feedback.classList.add('feedback', 'invalid-feedback', 'row');
    feedback.textContent = message;
    return feedback;
  };
  // TODO: добавить количество постов к фиду
  // TODO: добавить возможность убрать фид
  // TODO: добавить у постов справа muted текстом id фида, и у фидов muted их id
  // TODO: добавить подсветку при наведениее на фид
  // TODO: добавить сортировки
  const getFeedsList = (feeds) => feeds.map((feed) => {
    const feedElement = document.createElement('div');
    feedElement.classList.add('card', 'p-3', 'feed');

    const title = document.createElement('h5');
    title.textContent = feed.title;
    const description = document.createElement('p');
    description.classList.add('text-muted');
    description.textContent = `Описание: ${feed.description}`;
    const link = document.createElement('p');
    link.textContent = `${lang.t('source')}: ${feed.link}`;
    const source = document.createElement('p');
    source.textContent = `URL фида: ${feed.sourceUrl}`;
    source.classList.add('text-muted');

    feedElement.setAttribute('data-feed-id', feed.id);
    feedElement.append(title, description, link, source);
    feedElement.addEventListener('mouseenter', toggleActive);
    feedElement.addEventListener('mouseleave', toggleActive);
    return feedElement;
  });
  const getPostsList = (posts) => posts.map((post) => {
    const feedTitle = document.createElement('h5');
    feedTitle.textContent = find(state.loadedFeeds, (feed) => feed.id === post.parentFeedId).title;
    const postElement = document.createElement('div');
    postElement.classList.add('card', 'p-3', 'post');
    const title = document.createElement('h5');
    title.textContent = post.title;
    const description = document.createElement('p');
    description.textContent = post.description;
    const link = document.createElement('a');
    link.classList.add('text-sm', 'text-secondary', 'post-link');
    link.textContent = post.link;
    link.setAttribute('href', post.link);

    postElement.setAttribute('data-feed-id', post.parentFeedId);
    postElement.append(title, link, description);
    postElement.addEventListener('mouseenter', toggleActive);
    postElement.addEventListener('mouseleave', toggleActive);
    return postElement;
  });

  // Render feeds and posts
  if (state.loadedFeeds.length) {
    const feedsList = getFeedsList(state.loadedFeeds);
    const postsList = getPostsList(state.loadedPosts);
    feedsTarget.replaceChildren(...feedsList);
    postsTarget.replaceChildren(...postsList);
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
