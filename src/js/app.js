import onChange from 'on-change';
import * as yup from 'yup';
import render from './view';

export default () => {
  const state = {
    form: {
      inputValue: '',
      isLinkValid: true,
      errors: {
        linkValidity: undefined,
      },
    },
    currentFeedUrl: undefined,
  };

  const watchedState = onChange(state, (path, value) => {
    console.log('statechanged');
    render(watchedState);
  });

  const validationSchema = yup.string().required().url();

  // Logic
  const linkInput = document.querySelector('#link-form_input');
  linkInput.addEventListener('input', () => {
    const link = linkInput.value;
    console.log(link);
    validationSchema.validate(link)
      .then((validLink) => {
        console.log('[Input] Link is valid.');
        watchedState.currentFeedUrl = validLink;
        watchedState.form.isLinkValid = true;
        watchedState.form.errors.linkValidity = undefined;
      })
      .catch((e) => {
        watchedState.form.isLinkValid = false;
        watchedState.form.errors.linkValidity = e.message;
        console.log(watchedState.form.errors);
        console.log('[Input] Link is invalid.');
      });
  });

  const form = document.querySelector('#link-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const link = linkInput.value;
    if (watchedState.form.isLinkValid === true) {
      watchedState.currentFeedUrl = link;
      console.log('[Submit] Link succefully submitted');
      form.reset();
    } else {
      console.log('[Submit] Can\'t submit, link is invalid.');
    }
  });
};
