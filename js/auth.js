// auth.js — Autenticação e sessão com Firebase

let _app = null;
let _auth = null;
let _db = null;

function initFirebase() {
  if (!_app) {
    _app  = firebase.initializeApp(firebaseConfig);
    _auth = firebase.auth();
    _db   = firebase.firestore();
  }
  return { auth: _auth, db: _db };
}

function getDB()   { return initFirebase().db; }
function getAuth() { return initFirebase().auth; }

// ── Login ──
async function login(username, password) {
  initFirebase();
  const email = `${username.trim().toLowerCase()}@aquarela.app`;

  const credential = await _auth.signInWithEmailAndPassword(email, password)
    .catch(() => { throw new Error('Usuário ou senha inválidos.'); });

  const profileDoc = await _db.collection('user_profiles').doc(credential.user.uid).get();
  if (!profileDoc.exists) throw new Error('Perfil não encontrado. Contate o administrador.');

  const profile = { id: profileDoc.id, ...profileDoc.data() };
  localStorage.setItem('aquarela_session', JSON.stringify(profile));
  return profile;
}

// ── Logout ──
async function logout() {
  initFirebase();
  await _auth.signOut();
  localStorage.removeItem('aquarela_session');
  window.location.href = 'login.html';
}

function getCurrentUser() {
  try {
    const s = localStorage.getItem('aquarela_session');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return null; }
  return user;
}

function requireMaster() {
  const user = requireAuth();
  if (!user) return null;
  if (user.role !== 'master') { window.location.href = 'dashboard.html'; return null; }
  return user;
}

function isMaster() {
  const user = getCurrentUser();
  return user && user.role === 'master';
}

// ── Preenche elementos na página com dados do usuário ──
function populateUserUI() {
  const user = getCurrentUser();
  if (!user) return;
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
  document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role === 'master' ? 'Administrador' : 'Profissional');
  document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = user.name.charAt(0).toUpperCase());
  document.querySelectorAll('[data-master-only]').forEach(el => { if (user.role !== 'master') el.style.display = 'none'; });
}

// ── Notificações de visitas com retorno próximo ──
async function checkReturnVisits() {
  const db = getDB();
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = today.toISOString().split('T')[0];
  const in3 = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];

  const snap = await db.collection('visitas_domiciliares')
    .where('status', '==', 'pending')
    .where('return_date', '>=', todayStr)
    .where('return_date', '<=', in3)
    .get();

  const visitas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (visitas.length > 0) {
    showNotificationBadge(visitas.length);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Equipe Aquarela', {
        body: `${visitas.length} visita(s) com retorno próximo!`,
      });
    }
  }
  return visitas;
}

function showNotificationBadge(count) {
  document.querySelectorAll('.notif-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ── Utilitários de data ──
function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

// ── Toast ──
function showToast(msg, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  const colors = { info:'#6A9AB0', success:'#6BAE8C', warning:'#E8A44A', error:'#D4706A' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:${colors[type]||colors.info};color:#fff;padding:14px 20px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.15);font-family:'Inter',sans-serif;font-size:14px;max-width:320px;animation:slideIn 0.3s ease;`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity='0'; toast.style.transform='translateX(100px)'; toast.style.transition='all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Timestamp agora ──
function nowTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}
