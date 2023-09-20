import { find } from 'lodash';

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
  const getShowPostModalButton = () => {
    const button = document.createElement('button');
    button.textContent = lang.t('view');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('clickable', 'true');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'col-auto');
    return button;
  };
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

    const showPostModalButton = getShowPostModalButton(post);

    postElement.setAttribute('data-feed-id', post.parentFeedId);
    postElement.setAttribute('data-post-id', post.id);
    postElement.append(title, showPostModalButton);
    postElement.classList.add('list-group-item', 'd-flex', 'post', 'justify-content-between', 'align-items-start', 'border-0');
    return postElement;
  });

  function renderModal() {
    if (state.currentShownModalPostId === null) {
      return;
    }
    const shownPost = find(state.loadedPosts, (post) => post.id === state.currentShownModalPostId);
    const { modalTitle, modalBody, modalFullButton } = elements;
    modalTitle.textContent = shownPost.title;
    modalBody.textContent = shownPost.description;
    modalFullButton.setAttribute('href', shownPost.source);
  }
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
  function renderViewedPosts() {
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
  renderViewedPosts();
  renderButtonFeedback();
  renderInputValidity();
  renderFeedback();
  renderModal();
}

export default render;
