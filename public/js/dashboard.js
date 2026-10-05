const token = sessionStorage.getItem('token');
if (!token) location.href = 'login.html';

document.getElementById('titulo').textContent = sessionStorage.getItem('hospital') || 'Hospital';

const ETIQUETAS = { operativo: 'Operativo', requiere_revision: 'Requiere revisión', dado_de_baja: 'Dado de baja' };
const $ = (id) => document.getElementById(id);
let equipos = [];

async function api(url, opts = {}) {
  const r = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  if (r.status === 401) { sessionStorage.clear(); location.href = 'login.html'; return; }
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Error');
  return data;
}

async function cargarResumen() {
  const r = await api('/api/equipos/resumen');
  ['total', 'operativo', 'requiere_revision', 'dado_de_baja'].forEach((k) => ($(`r-${k}`).textContent = r[k]));
}

async function cargarEquipos() {
  const p = new URLSearchParams();
  if ($('filtro').value) p.set('estado', $('filtro').value);
  if ($('buscar').value.trim()) p.set('q', $('buscar').value.trim());
  equipos = await api('/api/equipos?' + p);
  pintar();
}

function celda(tr, texto) {
  const td = document.createElement('td');
  td.textContent = texto || '—';
  tr.appendChild(td);
  return td;
}

function pintar() {
  const tbody = $('tbody');
  tbody.innerHTML = '';
  $('vacio').hidden = equipos.length > 0;
  equipos.forEach((e) => {
    const tr = document.createElement('tr');
    celda(tr, e.nombre);
    celda(tr, [e.marca, e.modelo].filter(Boolean).join(' / '));
    celda(tr, e.serial);
    celda(tr, e.ubicacion);
    celda(tr, e.fechaUltimaRevision ? new Date(e.fechaUltimaRevision).toLocaleDateString('es-CO') : '');

    const tdEstado = document.createElement('td');
    const b = document.createElement('span');
    b.className = `badge ${e.estado}`;
    b.textContent = ETIQUETAS[e.estado];
    tdEstado.appendChild(b);
    tr.appendChild(tdEstado);

    const tdAcc = document.createElement('td');
    const editar = document.createElement('button');
    editar.className = 'btn sec chico';
    editar.textContent = 'Editar';
    editar.onclick = () => abrirForm(e);
    const borrar = document.createElement('button');
    borrar.className = 'btn peligro chico';
    borrar.style.marginLeft = '.4rem';
    borrar.textContent = 'Eliminar';
    borrar.onclick = () => eliminar(e);
    tdAcc.append(editar, borrar);
    tr.appendChild(tdAcc);
    tbody.appendChild(tr);
  });
}

function abrirForm(e) {
  $('form').reset();
  $('error').textContent = '';
  $('dlg-titulo').textContent = e ? 'Editar equipo' : 'Nuevo equipo';
  $('id').value = e ? e._id : '';
  if (e) {
    ['nombre', 'marca', 'modelo', 'serial', 'ubicacion', 'estado', 'observaciones'].forEach((k) => ($(k).value = e[k] || ''));
    $('fechaUltimaRevision').value = e.fechaUltimaRevision ? e.fechaUltimaRevision.slice(0, 10) : '';
  }
  $('dlg').showModal();
}

async function eliminar(e) {
  if (!confirm(`¿Eliminar "${e.nombre}"? Esta acción no se puede deshacer.`)) return;
  await api(`/api/equipos/${e._id}`, { method: 'DELETE' });
  refrescar();
}

$('form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const body = {};
  ['nombre', 'marca', 'modelo', 'serial', 'ubicacion', 'estado', 'observaciones'].forEach((k) => (body[k] = $(k).value));
  body.fechaUltimaRevision = $('fechaUltimaRevision').value || null;
  const id = $('id').value;
  try {
    await api(id ? `/api/equipos/${id}` : '/api/equipos', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
    $('dlg').close();
    refrescar();
  } catch (err) {
    $('error').textContent = err.message;
  }
});

function refrescar() { cargarResumen(); cargarEquipos(); }

$('nuevo').onclick = () => abrirForm();
$('cancelar').onclick = () => $('dlg').close();
$('salir').onclick = () => { sessionStorage.clear(); location.href = 'index.html'; };
$('filtro').onchange = cargarEquipos;
let t; $('buscar').oninput = () => { clearTimeout(t); t = setTimeout(cargarEquipos, 300); };
document.querySelectorAll('.card').forEach((c) => (c.onclick = () => { $('filtro').value = c.dataset.estado; cargarEquipos(); }));

refrescar();
