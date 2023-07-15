function render(state) {
  const linkInput = document.querySelector('#link-form_input');
  const form = document.querySelector('#link-form');
  const feedback = document.querySelector('.feedback');

  // Render input validity style and error feedback
  if (state.form.isLinkValid === false) {
    linkInput.classList.add('is-invalid');

    const errorMessage = state.form.errors.linkValidity;
    if (!feedback) {
      const newFeedback = document.createElement('div');
      newFeedback.classList.add('feedback', 'invalid-feedback', 'row');
      newFeedback.textContent = errorMessage;
      form.append(newFeedback);
    } else {
      feedback.textContent = errorMessage;
    }
  } else {
    linkInput.classList.remove('is-invalid');

    if (feedback) {
      feedback.remove();
    }
  }
}

export default render;
