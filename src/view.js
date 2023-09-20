import { find } from 'lodash';

const getFeedbackElement = (message) => {
  const feedback = document.createElement('p');
  feedback.classList.add('feedback', 'small');
  feedback.textContent = message;
  return feedback;
};
const getFeedsList = (state) => state.data.loadedFeeds.map((feed) => {
  const feedElement = document.createElement('div');
  feedElement.classList.add('card', 'p-2', 'feed');

  const title = document.createElement('h2');
  title.textContent = feed.title;
  title.classList.add('h6');
  const description = document.createElement('p');
  description.classList.add('text-muted', 'small');
  description.textContent = `${feed.description}`;

  feedElement.setAttribute('data-feed-id', feed.id);
  feedElement.append(title, description);
  return feedElement;
});

const getShowPostModalButton = (lang) => {
  const button = document.createElement('button');
  button.textContent = lang.t('view');
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.setAttribute('clickable', 'true');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'col-auto');
  return button;
};

const getPostsList = (state, lang) => state.data.loadedPosts.map((post) => {
  const title = document.createElement('a');
  title.setAttribute('href', post.source);
  title.setAttribute('clickable', 'true');
  if (state.ui.viewedPostsId.includes(post.id)) {
    title.classList.add('link-secondary', 'fw-normal');
  } else {
    title.classList.add('fw-bold');
  }
  title.textContent = post.title;
  title.setAttribute('target', '_blank');

  const showPostModalButton = getShowPostModalButton(lang);

  const postElement = document.createElement('div');
  postElement.setAttribute('data-feed-id', post.parentFeedId);
  postElement.setAttribute('data-post-id', post.id);
  postElement.append(title, showPostModalButton);
  postElement.classList.add('list-group-item', 'd-flex', 'post', 'justify-content-between', 'align-items-start', 'border-0');
  return postElement;
});

function renderFeeds(state, elements) {
  const feedsList = getFeedsList(state);
  elements.feedsList.replaceChildren(...feedsList);
}

function renderPosts(state, elements, lang) {
  const postsList = getPostsList(state, lang);
  elements.postsList.replaceChildren(...postsList);
}

function renderModal(state, elements) {
  if (state.ui.currentShownModalPostId === null) {
    return;
  }
  const shownPost = find(
    state.data.loadedPosts,
    (post) => post.id === state.ui.currentShownModalPostId,
  );
  const { modalTitle, modalBody, modalFullButton } = elements;
  modalTitle.textContent = shownPost.title;
  modalBody.textContent = shownPost.description;
  modalFullButton.setAttribute('href', shownPost.source);
}

function renderViewedPosts(state) {
  const posts = document.querySelectorAll('.post');
  posts.forEach((post) => {
    const postId = post.getAttribute('data-post-id');
    const title = post.querySelector('a');
    if (state.ui.viewedPostsId.includes(postId)) {
      title.classList.remove('fw-bold');
      title.classList.add('link-secondary', 'fw-normal');
    }
  });
}

function renderSubmitButtonFeedback(state, elements) {
  if (state.ui.formState === 'processing') {
    elements.submitButton.setAttribute('disabled', '');
  } else {
    elements.submitButton.removeAttribute('disabled');
  }
}

function setFocus(state, elements) {
  if (state.formState === 'input') {
    elements.urlInput.focus();
  }
}

function renderInputValidity(state, elements) {
  if (state.feedback.error) {
    elements.urlInput.classList.add('is-invalid');
  } else {
    elements.urlInput.classList.remove('is-invalid');
  }
}

function renderFeedback(state, elements, lang) {
  elements.feedbackContainer.replaceChildren();
  if (state.feedback.error) {
    const errorMessage = lang.t(`errors.${state.feedback.error}`);
    const newFeedback = getFeedbackElement(errorMessage);
    newFeedback.classList.add('invalid-feedback', 'text-danger');
    elements.feedbackContainer.replaceChildren(newFeedback);
  }
  if (state.feedback.success === true) {
    const newFeedback = getFeedbackElement(lang.t('success'));
    newFeedback.classList.add('valid-feedback', 'text-success');
    elements.feedbackContainer.replaceChildren(newFeedback);
  }
}

const getRenderFunction = (state, elements, lang) => (path) => {
  switch (path) {
    case 'data.loadedFeeds':
      renderFeeds(state, elements);
      break;
    case 'data.loadedPosts':
      renderPosts(state, elements, lang);
      break;
    case 'ui.currentShownModalPostId':
      renderModal(state, elements);
      break;
    case 'ui.viewedPostsId':
      renderViewedPosts(state);
      break;
    case 'ui.formState':
      renderSubmitButtonFeedback(state, elements);
      setFocus(state, elements);
      break;
    case 'feedback.error':
    case 'feedback.success':
      renderInputValidity(state, elements);
      renderFeedback(state, elements, lang);
      break;
    default:
      throw new Error(`Internal error. Wrong path: ${path}`);
  }
};
export default getRenderFunction;
