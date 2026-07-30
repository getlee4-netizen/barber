// ============================================
// AUTENTICAÇÃO - BarberBook
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    checkAuthStatus();
    
    // Setup form handlers
    setupLoginForm();
    setupCadastroForm();
});

// ============================================
// VERIFICAR STATUS DE AUTENTICAÇÃO
// ============================================

function checkAuthStatus() {
    const user = Utils.carregarDados('user');
    if (user) {
        // Usuário já está logado
        updateUserUI(user);
    }
}

function updateUserUI(user) {
    // Atualizar botões no header
    const loginBtns = document.querySelectorAll('a[href="login.html"]');
    const perfilBtn = document.getElementById('perfilBtn');
    
    if (user && perfilBtn) {
        perfilBtn.classList.remove('hidden');
    }
}

// ============================================
// LOGIN
// ============================================

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validações básicas
        if (!Utils.validarEmail(email)) {
            Utils.mostrarToast('E-mail inválido', 'erro');
            return;
        }
        
        if (password.length < 6) {
            Utils.mostrarToast('Senha deve ter no mínimo 6 caracteres', 'erro');
            return;
        }
        
        // Mostrar loading
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Entrando...';
        btn.disabled = true;
        
        try {
            // Simular login (substituir por Supabase Auth)
            await simulateLogin(email, password);
            
            Utils.mostrarToast('Login realizado com sucesso!', 'sucesso');
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            
        } catch (error) {
            Utils.mostrarToast(error.message || 'Erro ao fazer login', 'erro');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// ============================================
// CADASTRO
// ============================================

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
        
        // Validações
        if (nome.length < 3) {
            Utils.mostrarToast('Nome deve ter no mínimo 3 caracteres', 'erro');
            return;
        }
        
        if (!Utils.validarEmail(email)) {
            Utils.mostrarToast('E-mail inválido', 'erro');
            return;
        }
        
        if (password.length < 6) {
            Utils.mostrarToast('Senha deve ter no mínimo 6 caracteres', 'erro');
            return;
        }
        
        if (password !== confirmPassword) {
            Utils.mostrarToast('As senhas não conferem', 'erro');
            return;
        }
        
        if (!terms) {
            Utils.mostrarToast('Aceite os termos de uso', 'erro');
            return;
        }
        
        // Mostrar loading
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Criando conta...';
        btn.disabled = true;
        
        try {
            // Simular cadastro (substituir por Supabase Auth)
            await simulateRegister({ nome, email, telefone, password });
            
            Utils.mostrarToast('Conta criada com sucesso!', 'sucesso');
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            
        } catch (error) {
            Utils.mostrarToast(error.message || 'Erro ao criar conta', 'erro');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// ============================================
// LOGIN SOCIAL
// ============================================

function loginWithGoogle() {
    // Implementar com Supabase Auth
    Utils.mostrarToast('Login com Google em desenvolvimento', 'info');
}

function loginWithFacebook() {
    // Implementar com Supabase Auth
    Utils.mostrarToast('Login com Facebook em desenvolvimento', 'info');
}

function registerWithGoogle() {
    loginWithGoogle();
}

function registerWithFacebook() {
    loginWithFacebook();
}

// ============================================
// SIMULAÇÃO (Substituir por Supabase)
// ============================================

async function simulateLogin(email, password) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular sucesso
    const user = {
        id: Utils.gerarId(),
        email: email,
        nome: email.split('@')[0],
        role: 'cliente',
        created_at: new Date().toISOString()
    };
    
    Utils.salvarDados('user', user);
    return user;
}

async function simulateRegister(userData) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular sucesso
    const user = {
        id: Utils.gerarId(),
        ...userData,
        role: 'cliente',
        created_at: new Date().toISOString()
    };
    
    Utils.salvarDados('user', user);
    return user;
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    Utils.removerDados('user');
    Utils.mostrarToast('Logout realizado', 'sucesso');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Exportar funções
window.auth = {
    login: simulateLogin,
    register: simulateRegister,
    logout: logout,
    loginWithGoogle,
    loginWithFacebook
};
