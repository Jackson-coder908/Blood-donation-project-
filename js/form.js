const form = document.getElementById('donateForm');
const successEl = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

    // Validate required text/email/date inputs
    form.querySelectorAll('input[required], select[required]').forEach(input => {
      const group = input.closest('.form-group');
      if (!input.value.trim()) {
        group.classList.add('has-error');
        valid = false;
      }
      if (input.type === 'email' && input.value && !input.value.includes('@')) {
        group.classList.add('has-error');
        valid = false;
      }
      if (input.type === 'checkbox' && !input.checked) {
        group.classList.add('has-error');
        valid = false;
      }
    });

    if (valid) {
      form.style.display = 'none';
      successEl.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const firstError = form.querySelector('.has-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Live validation
  form.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group) group.classList.remove('has-error');
    });
  });
}
