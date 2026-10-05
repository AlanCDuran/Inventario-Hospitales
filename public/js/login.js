document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const error = document.getElementById('error');
  error.textContent = '';
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: document.getElementById('usuario').value,
        password: document.getElementById('password').value
      })
    });
    const data = await r.json();
    if (!r.ok) { error.textContent = data.error || 'Error al ingresar'; return; }
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('hospital', data.hospital);
    location.href = 'dashboard.html';
  } catch {
    error.textContent = 'No se pudo conectar con el servidor';
  }
});
