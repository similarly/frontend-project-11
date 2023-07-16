import onChange from 'on-change';
import * as yup from 'yup';
import render from './view';

export default (target, lang) => {
  const state = {
    form: {
      inputValue: '',
      isLinkValid: true,
      errors: {
        linkValidity: undefined,
      },
    },
    currentFeeds: [],
  };

  const watchedState = onChange(state, () => {
    render(watchedState, lang);
  });

  // Init validation
  yup.setLocale({
    mixed: {
      required: 'requiredField',
      notOneOf: 'alreadySubmitted',
    },
    string: {
      url: 'validUrl',
    },
  });

  // Logic

  const linkInput = document.querySelector('#link-form_input');
  linkInput.focus();

  const validateLink = (link) => {
    const schema = yup.string().required().url().notOneOf(watchedState.currentFeeds);
    const validatedPromise = schema.validate(link)
      .then((validLink) => {
        watchedState.currentFeeds.push(validLink);
        watchedState.form.isLinkValid = true;
        watchedState.form.errors.linkValidity = undefined;
        console.log('[Input] Link is valid.');
      })
      .catch((e) => {
        watchedState.form.isLinkValid = false;
        watchedState.form.errors.linkValidity = e.message;
        console.log(e);
        // watchedState.form.errors.linkValidity = e.name;
        console.log('[Input] Link is invalid.', watchedState.form.errors);
      });
    return validatedPromise;
  };

  const form = document.querySelector('#link-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const link = linkInput.value;
    validateLink(link).then(() => {
      if (watchedState.form.isLinkValid === true) {
        watchedState.currentFeeds.push(link);
        console.log('[Submit] Link succefully submitted');
        form.reset();
        linkInput.focus();
      } else {
        console.log('[Submit] Can\'t submit, link is invalid.');
      }
    });
  });
};
