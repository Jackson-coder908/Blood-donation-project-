function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'Hide';
  } else {
    input.type = 'password';
    btn.textContent = 'Show';
  }
}

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    loginForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
    loginForm.querySelectorAll('input[required]').forEach(inp => {
      if (!inp.value.trim()) {
        inp.closest('.form-group').classList.add('has-error');
        valid = false;
      }
    });

    if (valid) {
      const email = document.getElementById('loginEmail').value;
      const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      document.getElementById('profileName').textContent = name || 'Demo Donor';
      document.getElementById('profileEmail').textContent = email;
      document.getElementById('profileAvatar').textContent = (name[0] || 'D').toUpperCase();

      document.getElementById('loginView').style.display = 'none';
      document.getElementById('profileView').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

function logout() {
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('loginView').style.display = 'grid';
  document.getElementById('loginForm').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
                                                      } 
