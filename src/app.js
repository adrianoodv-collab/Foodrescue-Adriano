import { client, onDonationSessionChange } from './auth.js';
import { loadDonations, validateDonation, saveDonation } from './donations.js';

const entry = document.querySelector('#donation-entry');
const history = document.querySelector('#donation-history');
const form = document.querySelector('#donation-form');
const submitButton = form.querySelector('button');
const status = document.querySelector('#status');
const list = document.querySelector('#donations');
const listMessage = document.querySelector('#donations-message');
let activeSession = null;

function showErrors(errors) {
  for (const field of Object.keys(Object.fromEntries(new FormData(form)))) {
    document.getElementById(`${field}-error`).textContent = errors[field] || '';
    form.elements[field].setAttribute('aria-invalid', String(Boolean(errors[field])));
  }
}

function donationCard(item) {
  const card = document.createElement('article');
  const title = document.createElement('h3');
  title.textContent = item.tipo_comida;
  card.append(title);
  const details = [
    `Estado: ${item.estado}`,
    `Porciones: ${item.porciones}`,
    `Recoger antes de: ${new Date(item.limite_recoleccion).toLocaleString()}`,
    `Punto de recolección: ${item.ubicacion}`,
  ];
  for (const text of details) {
    const line = document.createElement('p');
    line.textContent = text;
    card.append(line);
  }
  return card;
}

onDonationSessionChange(async userId => {
  const session = userId ? { userId } : null;
  activeSession = session;
  entry.hidden = history.hidden = !session;
  submitButton.disabled = true;
  list.replaceChildren();
  listMessage.textContent = '';
  status.textContent = '';
  form.reset();
  showErrors({});
  if (!session) return;

  listMessage.textContent = 'Cargando donaciones…';
  try {
    const items = await loadDonations(client, session.userId);
    if (activeSession !== session) return;
    list.replaceChildren(...items.map(donationCard));
    listMessage.textContent = items.length ? '' : 'Todavía no hay donaciones registradas.';
  } catch {
    if (activeSession === session) {
      listMessage.textContent = 'No se pudo cargar el historial. Recarga la página para volver a consultarlo.';
    }
  } finally {
    if (activeSession === session) submitButton.disabled = false;
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const session = activeSession;
  if (!session || submitButton.disabled) return;

  const values = Object.fromEntries(new FormData(form));
  const errors = validateDonation(values);
  showErrors(errors);
  if (Object.keys(errors).length) {
    form.elements[Object.keys(errors)[0]].focus();
    status.textContent = 'Revisa los campos indicados.';
    return;
  }

  submitButton.disabled = true;
  status.textContent = 'Guardando donación…';
  try {
    const donation = await saveDonation(client, values);
    if (activeSession !== session) return;
    list.prepend(donationCard(donation));
    if (list.children.length === 1 && listMessage.textContent === 'Todavía no hay donaciones registradas.') {
      listMessage.textContent = '';
    }
    form.reset();
    status.textContent = 'Donación registrada correctamente como disponible.';
  } catch {
    if (activeSession === session) {
      status.textContent = 'No se pudo confirmar el registro. Tus datos siguen en el formulario. Consulta el historial antes de volver a enviar.';
    }
  } finally {
    if (activeSession === session) submitButton.disabled = false;
  }
});
