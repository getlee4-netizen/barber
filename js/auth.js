document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupLoginForm();
    setupCadastroForm();
    setupHeaderAuth();
});

function checkAuthStatus() {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) loadUserProfile(session.user);
    });
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) loadUserProfile(session.user);
        else if (event === 'SIGNED_OUT') { Utils.removerDados('user'); updateHeaderUI(null); }
    });
}

async function loadUserProfile(user) {
    try {
        const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
        if (data) { Utils.salvarDados('user', data); updateHeaderUI(data); }
        else if (user.email) {
            const profile = { id: user.id, email: user.email, nome: user.user_metadata?.nome || user.email.split('@')[0], telefone: user.user_metadata?.telefone || '', role: 'cliente', created_at: user.created_at };
            Utils.salvarDados('user', profile); updateHeaderUI(profile);
        }
    } catch (err) { console.error('Erro ao carregar perfil:', err); }
}

function updateHeaderUI(user) {
    const loginBtns = document.querySelectorAll('a[href="login.html"]');
    const perfilBtn = document.getElementById('perfilBtn');
    if (user) { loginBtns.forEach(b => b.style.display = 'none'); if (perfilBtn) perfilBtn.classList.remove('hidden'); }
    else { loginBtns.forEach(b => b.style.display = ''); if (perfilBtn) perfilBtn.classList.add('hidden'); }
}

function setupHeaderAuth() { updateHeaderUI(Utils.carregarDados('user')); }

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (!Utils.validarEmail(email)) { Utils.mostrarToast('E-mail invÃ¡lido', 'erro'); return; }
        if (password.length < 6) { Utils.mostrarToast('Senha deve ter no mÃ­nimo 6 caracteres', 'erro'); return; }
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Entrando...'; btn.disabled = true;
        try {
            if (!supabase) throw new Error('Supabase nÃ£o configurado');
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            Utils.mostrarToast('Login realizado com sucesso!', 'sucesso');
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        } catch (error) {
            let msg = error.message || 'Erro ao fazer login';
            if (msg.includes('Invalid login')) msg = 'E-mail ou senha incorretos';
            Utils.mostrarToast(msg, 'erro'); btn.innerHTML = orig; btn.disabled = false;
        }
    });
}

function setupCadastroForm() {
    const form = document.getElementById('cadastroForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        if (nome.length < 3) { Utils.mostrarToast('Nome deve ter no mÃ­nimo 3 caracteres', 'erro'); return; }
        if (!Utils.validarEmail(email)) { Utils.mostrarToast('E-mail invÃ¡lido', 'erro'); return; }
        if (password.length < 6) { Utils.mostrarToast('Senha deve ter no mÃ­nimo 6 caracteres', 'erro'); return; }
        if (password !== confirmPassword) { Utils.mostrarToast('As senhas nÃ£o conferem', 'erro'); return; }
        if (!terms) { Utils.mostrarToast('Aceite os termos de uso', 'erro'); return; }
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Criando conta...'; btn.disabled = true;
        try {
            if (!supabase) throw new Error('Supabase nÃ£o configurado');
            const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nome, telefone } } });
            if (error) throw error;
            if (data.user) {
                await supabase.from('usuarios').insert({ id: data.user.id, nome, email, telefone, role: 'cliente', created_at: new Date().toISOString() });
            }
            Utils.mostrarToast('Conta criada com sucesso! Verifique seu e-mail.', 'sucesso');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } catch (error) {
            let msg = error.message || 'Erro ao criar conta';
            if (msg.includes('already registered')) msg = 'Este e-mail jÃ¡ estÃ¡ cadastrado';
            Utils.mostrarToast(msg, 'erro'); btn.innerHTML = orig; btn.disabled = false;
        }
    });
}

async function loginWithGoogle() {
    try {
        if (!supabase) throw new Error('Supabase nÃ£o configurado');
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/index.html' } });
        if (error) throw error;
    } catch (error) { Utils.mostrarToast(error.message || 'Erro ao conectar com Google', 'erro'); }
}

async function loginWithFacebook() {
    try {
        if (!supabase) throw new Error('Supabase nÃ£o configurado');
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin + '/index.html' } });
        if (error) throw error;
    } catch (error) { Utils.mostrarToast(error.message || 'Erro ao conectar com Facebook', 'erro'); }
}

function registerWithGoogle() { loginWithGoogle(); }
function registerWithFacebook() { loginWithFacebook(); }

async function logout() {
    try { if (supabase) await supabase.auth.signOut(); Utils.removerDados('user'); Utils.mostrarToast('Logout realizado', 'sucesso'); setTimeout(() => { window.location.href = 'index.html'; }, 1000); }
    catch (error) { Utils.mostrarToast('Erro ao fazer logout', 'erro'); }
}

window.auth = { logout, loginWithGoogle, loginWithFacebook };
