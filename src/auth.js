const message = document.querySelector('#auth-message');
const forms = document.querySelector('#auth-forms');
const sessionPanel = document.querySelector('#auth-session');
const greeting = document.querySelector('#auth-greeting');
const signup = document.querySelector('#signup-form');
const login = document.querySelector('#login-form');
const logout = document.querySelector('#logout-button');
export let client;
let currentUserId = null;
const sessionListeners = new Set();

export function onDonationSessionChange(listener) {
  sessionListeners.add(listener);
  listener(currentUserId);
}

function publishSession(userId) {
  if (currentUserId === userId) return;
  currentUserId = userId;
  for (const listener of sessionListeners) listener(userId);
}
let busy = false;
let generation = 0;
function setBusy(value) {
  busy = value;
  document.querySelectorAll('#account button').forEach(button => { button.disabled = value; });
}
function anonymous() {
  publishSession(null);
  generation++;
  greeting.textContent = '';
  sessionPanel.hidden = true;
  forms.hidden = false;
}
function errorText(error) {
  if (error.code === 'user_already_exists' || /already registered/i.test(error.message)) return 'Este correo ya está registrado.';
  if (error.code === 'invalid_credentials') return 'Correo o contraseña incorrectos.';
  return `No se pudo completar la operación: ${error.message || 'revisa tu conexión e inténtalo de nuevo.'}`;
}
async function showSession(session) {
  const ticket = ++generation;
  if (!session) { anonymous(); message.textContent = ''; return; }
  publishSession(session.user.id);
  forms.hidden = true;
  sessionPanel.hidden = false;
  greeting.textContent = '';
  message.textContent = 'Cargando perfil…';
  try {
    const { data, error } = await client.from('perfiles').select('nombre').eq('id', session.user.id).single();
    if (error) throw error;
    if (!data?.nombre?.trim()) throw new Error('No se encontró un nombre en tu perfil.');
    if (ticket !== generation) return;
    greeting.textContent = `Hola, ${data.nombre}`;
    message.textContent = '';
  } catch (error) {
    if (ticket === generation) message.textContent = errorText(error);
  }
}
async function submit(event, registering) {
  event.preventDefault();
  if (!client || busy) return;
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  if (registering && (!values.nombre.trim() || values.password.length < 6)) {
    message.textContent = 'Ingresa un nombre y una contraseña de al menos seis caracteres.';
    return;
  }
  setBusy(true);
  generation++;
  message.textContent = 'Procesando…';
  try {
    const credentials = { email: values.email.trim(), password: values.password };
    const { data, error } = registering ? await client.auth.signUp(credentials) : await client.auth.signInWithPassword(credentials);
    if (error) throw error;
    if (!data.session) throw new Error('No se recibió una sesión. Verifica la configuración de confirmación de correo.');
    if (registering) {
      const { error: profileError } = await client.from('perfiles').insert({ id: data.user.id, nombre: values.nombre.trim() });
      if (profileError) {
        const { error: signoutError } = await client.auth.signOut({ scope: 'local' });
        if (signoutError) {
          forms.hidden = true;
          sessionPanel.hidden = false;
          throw new Error('La cuenta se creó, pero el perfil y el cierre de sesión fallaron. Usa Cerrar sesión para reintentar.');
        }
        anonymous();
        throw new Error('La cuenta se creó, pero no se pudo guardar su perfil. No se completó el registro.');
      }
    }
    form.reset();
    await showSession(data.session);
  } catch (error) { message.textContent = errorText(error); }
  finally { setBusy(false); }
}
signup.addEventListener('submit', event => submit(event, true));
login.addEventListener('submit', event => submit(event, false));
logout.addEventListener('click', async () => {
  if (!client || busy) return;
  setBusy(true);
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw error;
    anonymous();
    signup.reset(); login.reset();
    message.textContent = '';
  } catch (error) { message.textContent = errorText(error); }
  finally { setBusy(false); }
});
try {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm');
  client = createClient('https://jzwmnseovlcsixkdafyu.supabase.co', 'sb_publishable_6k5gspWHjDCGuvQTLYDf-A_ekanH4IS', { auth: { persistSession: true, autoRefreshToken: true } });
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') publishSession(null);
    if (busy) return;
    const ticket = ++generation;
    setTimeout(() => { if (!busy && ticket === generation) void showSession(session); }, 0);
  });
} catch (error) {
  message.textContent = errorText(error);
}
