import { find } from 'lodash';
import { Modal } from 'bootstrap';

function render(state, lang) {
  const linkInput = document.querySelector('#link-form_input');
  const form = document.querySelector('#link-form');
  const button = document.querySelector('#link-form_button');
  const feedsTarget = document.querySelector('#feeds');
  const postsTarget = document.querySelector('#posts');
  function renderSeenLinks() {
    const posts = document.querySelectorAll('.post');
    posts.forEach((post) => {
      const postId = post.getAttribute('data-post-id');
      const title = post.querySelector('a');
      if (state.seenPostIds.includes(postId)) {
        console.log(title);
        title.classList.remove('fw-bold');
        title.classList.add('link-secondary', 'fw-normal');
        console.log(title);
      }
    });
  }

  const toggleActive = (e) => {
    const { feedId } = e.target.dataset;
    const targetPosts = document.querySelectorAll(`.post[data-feed-id="${feedId}"]`);
    const targetFeed = document.querySelector(`.feed[data-feed-id="${feedId}"]`);
    targetPosts.forEach((post) => post.classList.toggle('active'));
    targetFeed.classList.toggle('active');
  };
  const getFeedbackElement = (message) => {
    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'small'); // valid feedback
    feedback.textContent = message;
    return feedback;
  };
  // TODO: разнести стейт и рендерфункции через свитчкейс
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
    feedElement.addEventListener('mouseenter', toggleActive);
    feedElement.addEventListener('mouseleave', toggleActive);
    return feedElement;
  });
  const getPostModal = (post) => {
    const modalHtml = `
    <div id="postModal" class="modal fade show" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"></h5>
            <button type="button" class="btn-close close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-break"></div>
          <div class="modal-footer">
          <a class="btn btn-primary post-source" target="_blank">Читать</a>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
          </div>
        </div>
      </div>
    </div>`;
    const modal = new DOMParser().parseFromString(modalHtml, 'text/html');
    modal.querySelector('.modal-title').textContent = post.title;
    modal.querySelector('.modal-body').textContent = post.description;
    modal.querySelector('.post-source').setAttribute('href', post.source);
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
    return modal.querySelector('#postModal');
  };
  const getPostsList = (posts) => posts.map((post) => {
    const feedTitle = document.createElement('h5');
    feedTitle.textContent = find(state.loadedFeeds, (feed) => feed.id === post.parentFeedId).title;
    const postElement = document.createElement('div');
    const title = document.createElement('a');
    title.setAttribute('href', post.source);
    title.setAttribute('clickable', 'true');
    title.classList.add('col', 'fw-bold', 'd-flex', 'align-items-center');
    title.textContent = post.title;
    title.setAttribute('target', '_blank');
    const description = document.createElement('p');
    description.textContent = post.description;

    const showPostModalButton = document.createElement('button');
    showPostModalButton.textContent = lang.t('view');
    showPostModalButton.setAttribute('data-toggle', 'modal');
    showPostModalButton.setAttribute('data-target', '#postModal');
    showPostModalButton.setAttribute('clickable', 'true');
    showPostModalButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'col-auto');

    const postModal = getPostModal(post);
    showPostModalButton.addEventListener('click', () => {
      document.body.append(postModal);
      const modal = new Modal('#postModal');
      modal.show();
    });
    postElement.setAttribute('data-feed-id', post.parentFeedId);
    postElement.setAttribute('data-post-id', post.id);
    postElement.append(title, showPostModalButton);
    postElement.classList.add('row', 'post');
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
  renderSeenLinks();
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

  // Set feedback
  const currentFeedback = document.querySelectorAll('.feedback');
  if (currentFeedback.length) {
    currentFeedback.forEach((feedback) => feedback.remove());
  }
  Object.entries(state.errors).forEach(([errorCode, isErrorThrown]) => {
    if (isErrorThrown) {
      const errorMessage = lang.t(`errors.${errorCode}`);
      const newFeedback = getFeedbackElement(errorMessage);
      newFeedback.classList.add('invalid-feedback', 'text-danger');
      form.append(newFeedback);
    }
  });
  if (state.success === true) {
    const newFeedback = getFeedbackElement(lang.t('success'));
    newFeedback.classList.add('valid-feedback', 'text-success');
    form.append(newFeedback);
  }
}

export default render;
