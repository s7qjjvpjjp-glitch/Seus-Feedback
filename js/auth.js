// auth.js — Autenticação e sessão da Equipe Aquarela

let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

async function login(username, password) {
  const sb = getSupabase();
  const email = `${username.trim().toLowerCase()}@aquarela.app`;

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Usuário ou senha inválidos.');

  const { data: profile, error: profileErr } = await sb
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileErr || !profile) throw new Error('Perfil não encontrado.');

  const session = {
    id: data.user.id,
    username: profile.username,
    name: profile.name,
    role: profile.role,
    area: profile.area,
    avatar_url: profile.avatar_url
  };

  localStorage.setItem('aquarela_session', JSON.stringify(session));
  return session;
}

async function logout() {
  const sb = getSupabase();
  await sb.auth.signOut();
  localStorage.removeItem('aquarela_session');
  window.location.href = '/login.html';
}

function getCurrentUser() {
  try {
    const stored = localStorage.getItem('aquarela_session');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function requireMaster() {
  const user = requireAuth();
  if (!user) return null;
  if (user.role !== 'master') {
    window.location.href = 'dashboard.html';
    return null;
  }
  return user;
}

function isMaster() {
  const user = getCurrentUser();
  return user && user.role === 'master';
}

// Preenche elementos com data-user-name e data-user-role na página
function populateUserUI() {
  const user = getCurrentUser();
  if (!user) return;

  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user.name;
  });
  document.querySelectorAll('[data-user-role]').forEach(el => {
    el.textContent = user.role === 'master' ? 'Administrador' : 'Profissional';
  });
  document.querySelectorAll('[data-user-initial]').forEach(el => {
    el.textContent = user.name.charAt(0).toUpperCase();
  });
  document.querySelectorAll('[data-master-only]').forEach(el => {
    if (user.role !== 'master') el.style.display = 'none';
  });
}

// Verifica visitas com retorno em ≤3 dias e exibe notificações
async function checkReturnVisits() {
  const sb = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const { data: visitas } = await sb
    .from('visitas_domiciliares')
    .select('*')
    .eq('status', 'pending')
    .lte('return_date', inThreeDays)
    .gte('return_date', today);

  if (!visitas || visitas.length === 0) return;

  showNotificationBadge(visitas.length);

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Equipe Aquarela', {
      body: `${visitas.length} visita(s) com retorno próximo!`,
      icon: 'assets/logo-aquarela.svg'
    });
  }

  return visitas;
}

function showNotificationBadge(count) {
  const badges = document.querySelectorAll('.notif-badge');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// Solicita permissão de notificação do browser
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Formata data ISO para DD/MM/YYYY
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Retorna diferença em dias entre hoje e uma data
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}

function showToast(msg, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const colors = { info: '#6A9AB0', success: '#6BAE8C', warning: '#E8A44A', error: '#D4706A' };
  toast.style.cssText = `
    background:${colors[type] || colors.info};
    color:#fff;padding:14px 20px;border-radius:10px;
    box-shadow:0 4px 16px rgba(0,0,0,0.15);
    font-family:'Inter',sans-serif;font-size:14px;
    max-width:320px;animation:slideIn 0.3s ease;
  `;
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
