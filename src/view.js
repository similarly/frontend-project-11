import { find } from 'lodash';
import { Modal } from 'bootstrap';

function render(state, elements, lang) {
  /* TODO:
    add switch case
  */
  if (state.formState === 'input') {
    elements.urlInput.focus();
  }
  const getFeedbackElement = (message) => {
    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'small');
    feedback.textContent = message;
    return feedback;
  };
  const getFeedsList = (feeds) => feeds.map((feed) => {
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

  const getPostsList = (posts) => posts.map((post) => {
    const feedTitle = document.createElement('h5');
    feedTitle.textContent = find(state.loadedFeeds, (feed) => feed.id === post.parentFeedId).title;
    const postElement = document.createElement('div');
    const title = document.createElement('a');
    title.setAttribute('href', post.source);
    title.setAttribute('clickable', 'true');
    title.classList.add('fw-bold');
    title.textContent = post.title;
    title.setAttribute('target', '_blank');
    const description = document.createElement('p');
    description.textContent = post.description;

    const modal = document.querySelector('#modal');

    const showPostModalButton = document.createElement('button');
    showPostModalButton.textContent = lang.t('view');
    showPostModalButton.setAttribute('data-bs-toggle', 'modal');
    showPostModalButton.setAttribute('data-bs-target', '#modal');
    showPostModalButton.setAttribute('clickable', 'true');
    showPostModalButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'col-auto');
    showPostModalButton.addEventListener('click', () => {
      modal.querySelector('.modal-title').textContent = post.title;
      modal.querySelector('.modal-body').textContent = post.description;
      modal.querySelector('.full-article').setAttribute('href', post.source);
    });
    postElement.setAttribute('data-feed-id', post.parentFeedId);
    postElement.setAttribute('data-post-id', post.id);
    postElement.append(title, showPostModalButton);
    postElement.classList.add('list-group-item', 'd-flex', 'post', 'justify-content-between', 'align-items-start', 'border-0');
    return postElement;
  });

  function renderFeedsAndPosts() {
    if (state.loadedFeeds.length) {
      const feedsList = getFeedsList(state.loadedFeeds);
      const postsList = getPostsList(state.loadedPosts);
      elements.feedsList.replaceChildren(...feedsList);
      elements.postsList.replaceChildren(...postsList);
    } else {
      elements.feedsList.replaceChildren();
      elements.postsList.replaceChildren();
    }
  }
  function renderSeenLinks() {
    const posts = document.querySelectorAll('.post');
    posts.forEach((post) => {
      const postId = post.getAttribute('data-post-id');
      const title = post.querySelector('a');
      if (state.seenPostIds.includes(postId)) {
        title.classList.remove('fw-bold');
        title.classList.add('link-secondary', 'fw-normal');
      }
    });
  }
  function renderButtonFeedback() {
    if (state.formState === 'processing') {
      elements.submitButton.setAttribute('disabled', '');
    } else {
      elements.submitButton.removeAttribute('disabled');
    }
  }
  function renderInputValidity() {
    if (state.error) {
      elements.urlInput.classList.add('is-invalid');
    } else {
      elements.urlInput.classList.remove('is-invalid');
    }
  }
  function renderFeedback() {
    elements.feedbackContainer.replaceChildren();
    if (state.error) {
      const errorMessage = lang.t(`errors.${state.error}`);
      const newFeedback = getFeedbackElement(errorMessage);
      newFeedback.classList.add('invalid-feedback', 'text-danger');
      elements.feedbackContainer.replaceChildren(newFeedback);
    }
    if (state.success === true) {
      const newFeedback = getFeedbackElement(lang.t('success'));
      newFeedback.classList.add('valid-feedback', 'text-success');
      elements.feedbackContainer.replaceChildren(newFeedback);
    }
  }
  renderFeedsAndPosts();
  renderSeenLinks();
  renderButtonFeedback();
  renderInputValidity();
  renderFeedback();
}

export default render;
