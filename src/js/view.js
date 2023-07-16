function render(state, lang) {
  const linkInput = document.querySelector('#link-form_input');
  const form = document.querySelector('#link-form');
  const feedback = document.querySelector('.feedback');

  // Render input validity style
  if (state.form.isLinkValid === false) {
    linkInput.classList.add('is-invalid');
  } else {
    linkInput.classList.remove('is-invalid');
  }

  // Render error feedback
  if (feedback) {
    feedback.remove();
  }
  if (state.form.errors.linkValidity) {
    const errorMessage = lang.t(`errors.${state.form.errors.linkValidity}`);
    const newFeedback = document.createElement('div');
    newFeedback.classList.add('feedback', 'invalid-feedback', 'row');
    newFeedback.textContent = errorMessage;
    form.append(newFeedback);
  }
}

export default render;
