/* ============================================
   script.js  —  Registro de Personas
   ============================================ */

'use strict';

// ── Selectores ──────────────────────────────
const tabBtns      = document.querySelectorAll('.tab-btn');
const tabPanels    = document.querySelectorAll('.tab-panel');

const formRegistro = document.getElementById('form-registro');
const formMsg      = document.getElementById('form-msg');
const btnSubmit    = document.getElementById('btn-submit');
const btnLabel     = btnSubmit.querySelector('.btn-label');
const btnSpinner   = btnSubmit.querySelector('.btn-spinner');

const buscador     = document.getElementById('buscador');
const listaEl      = document.getElementById('lista-personas');
const resultCount  = document.getElementById('result-count');

const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');

// ── Tabs ─────────────────────────────────────
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`tab-${target}`).classList.add('active');

    if (target === 'lista') cargarPersonas();
  });
});

// ── Validación del formulario ────────────────
const rules = {
  nombre:    v => v.trim().length >= 2   ? '' : 'Mínimo 2 caracteres.',
  profesion: v => v.trim().length >= 2   ? '' : 'Mínimo 2 caracteres.',
  edad:      v => v >= 1 && v <= 120     ? '' : 'Entre 1 y 120 años.',
  peso:      v => v > 0  && v <= 500     ? '' : 'Valor positivo (máx. 500 kg).',
};

function validateField(name, value) {
  const err = rules[name]?.(value) ?? '';
  const input = formRegistro.elements[name];
  const errEl = document.getElementById(`err-${name}`);
  input.classList.toggle('invalid', !!err);
  if (errEl) errEl.textContent = err;
  return !err;
}

formRegistro.querySelectorAll('input').forEach(input => {
  input.addEventListener('blur', () => {
    const val = input.type === 'number' ? parseFloat(input.value) : input.value;
    validateField(input.name, val);
  });
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    const errEl = document.getElementById(`err-${input.name}`);
    if (errEl) errEl.textContent = '';
    hideMsg();
  });
});

// ── Envío del formulario ─────────────────────
formRegistro.addEventListener('submit', async e => {
  e.preventDefault();

  const fields = ['nombre', 'profesion', 'edad', 'peso'];
  let valid = true;

  fields.forEach(name => {
    const input = formRegistro.elements[name];
    const val   = input.type === 'number' ? parseFloat(input.value) : input.value;
    if (!validateField(name, val)) valid = false;
  });

  if (!valid) return;

  setLoading(true);
  hideMsg();

  try {
    const data = new FormData(formRegistro);
    const res  = await fetch('guardar.php', { method: 'POST', body: data });
    const json = await res.json();

    if (json.success) {
      showMsg(json.message, 'success');
      formRegistro.reset();
      formRegistro.querySelectorAll('input').forEach(i => i.classList.remove('invalid'));
    } else {
      showMsg(json.message || 'Error al guardar.', 'error');
    }
  } catch (_) {
    showMsg('No se pudo conectar al servidor. ¿Está corriendo PHP?', 'error');
  } finally {
    setLoading(false);
  }
});

function setLoading(on) {
  btnSubmit.disabled = on;
  btnLabel.textContent = on ? 'Guardando…' : 'Guardar Registro';
  btnSpinner.classList.toggle('hidden', !on);
}

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className   = `form-msg ${type}`;
}

function hideMsg() {
  formMsg.className = 'form-msg hidden';
}

// ── Búsqueda con debounce ────────────────────
let debounceTimer;
buscador.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => cargarPersonas(buscador.value.trim()), 350);
});

// ── Cargar y renderizar personas ─────────────
async function cargarPersonas(buscar = '') {
  listaEl.innerHTML = '<div class="empty-state"><span class="empty-icon">◈</span><p>Cargando…</p></div>';
  resultCount.textContent = '';

  const url = buscar
    ? `obtener.php?buscar=${encodeURIComponent(buscar)}`
    : 'obtener.php';

  try {
    const res  = await fetch(url);
    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    renderPersonas(json.personas);
    resultCount.textContent = json.total
      ? `${json.total} resultado${json.total !== 1 ? 's' : ''}`
      : '';
  } catch (_) {
    listaEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠</span>
        <p>No se pudo cargar la lista. Verifica que el servidor PHP esté activo.</p>
      </div>`;
  }
}

function renderPersonas(personas) {
  if (!personas.length) {
    listaEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">◈</span>
        <p>No se encontraron registros.</p>
      </div>`;
    return;
  }

  listaEl.innerHTML = personas.map(p => `
    <div class="persona-card" data-id="${p.id}">
      <div class="card-initial">${p.nombre.charAt(0).toUpperCase()}</div>
      <div class="card-nombre">${escapeHtml(p.nombre)}</div>
      <div class="card-profesion">${escapeHtml(p.profesion)}</div>
      <div class="card-pills">
        <span class="pill">${p.edad} años</span>
        <span class="pill">${parseFloat(p.peso).toFixed(1)} kg</span>
      </div>
    </div>
  `).join('');

  // Asignar evento a cada tarjeta
  listaEl.querySelectorAll('.persona-card').forEach(card => {
    card.addEventListener('click', () => abrirModal(card.dataset.id));
  });
}

// ── Modal detalle ────────────────────────────
async function abrirModal(id) {
  try {
    const res  = await fetch(`obtener.php?id=${id}`);
    const json = await res.json();

    if (!json.success) return;

    const p = json.persona;
    document.getElementById('modal-nombre').textContent   = p.nombre;
    document.getElementById('modal-profesion').textContent = p.profesion;
    document.getElementById('modal-edad').textContent     = p.edad;
    document.getElementById('modal-peso').textContent     = parseFloat(p.peso).toFixed(1);
    document.getElementById('modal-id').textContent       = `#${p.id}`;
    document.getElementById('modal-fecha').textContent    = p.registrado;

    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } catch (_) { /* silencioso */ }
}

function cerrarModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) cerrarModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

// ── Utilidades ───────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
