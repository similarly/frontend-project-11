function render(state, lang) {
  const linkInput = document.querySelector('#link-form_input');
  const form = document.querySelector('#link-form');
  const currentFeedback = document.querySelector('.feedback');
  const button = document.querySelector('#link-form_button');

  const getFeedbackElement = (message) => {
    const feedback = document.createElement('div');
    feedback.classList.add('feedback', 'invalid-feedback', 'row');
    feedback.textContent = message;
    return feedback;
  };
  // Render processing or inptut state for responsivness
  // TODO: add more signs and deny any input, add spinner into button or somewhere else
  if (state.stage === 'processing') {
    button.textContent = 'o';
  } else {
    button.textContent = 'Go!';
  }
  // Render input state style

  if (Object.values(state.errors).reduce((ac, cur) => ac || (cur !== undefined))) {
    linkInput.classList.add('is-invalid');
  } else {
    linkInput.classList.remove('is-invalid');
  }

  // Render error feedback message; Now only shows one error message at time
  if (currentFeedback) {
    currentFeedback.remove();
  }
  // Look for errors in state
  Object.entries(state.errors).forEach(([errorType, errorShortname]) => {
    if (errorShortname !== undefined) {
      const errorMessage = lang.t(`errors.${errorShortname}`);
      const newFeedback = getFeedbackElement(errorMessage);
      form.append(newFeedback);
    }
  });
}

export default render;
