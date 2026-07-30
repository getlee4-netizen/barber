const SUPABASE_CONFIG = {
    url: 'https://yywukiomsbbbzochfibb.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5d3VraW9tc2JiYnpvY2hmaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNzI0NzYsImV4cCI6MjEwMDk0ODQ3Nn0.RcpsB5EL92b5oNm0z3QwqFb-t_cMAqAO0Rk6leK7S2U'
};

const supabase = window.supabase ? window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
) : null;

const CONFIG = {
    APP_NAME: 'BarberBook',
    VERSION: '1.0.0',
    STATUS_AGENDAMENTO: {
        PENDENTE: 'pendente',
        CONFIRMADO: 'confirmado',
        CONCLUIDO: 'concluido',
        CANCELADO: 'cancelado'
    },
    STATUS_CORES: {
        pendente: '#f59e0b',
        confirmado: '#10b981',
        concluido: '#6366f1',
        cancelado: '#ef4444'
    },
    HORARIO_PADRAO: { inicio: '09:00', fim: '19:00' },
    URLS: {
        HOME: 'index.html',
        LOGIN: 'login.html',
        CADASTRO: 'cadastro.html',
        AGENDAR: 'agendar.html',
        PERFIL: 'perfil.html',
        ADMIN: 'admin/',
        BARBEIRO: 'barbeiro/'
    }
};

const Utils = {
    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    },
    validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    mostrarToast(mensagem, tipo = 'sucesso', duracao = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + tipo;
        toast.innerHTML = '<span class="toast-icon">' + (tipo === 'sucesso' ? 'âœ“' : tipo === 'erro' ? 'âœ•' : 'â„¹') + '</span><span class="toast-mensagem">' + mensagem + '</span>';
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('mostrar'), 10);
        setTimeout(() => { toast.classList.remove('mostrar'); setTimeout(() => toast.remove(), 300); }, duracao);
    },
    carregarDados(chave) {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : null;
    },
    salvarDados(chave, dados) {
        localStorage.setItem(chave, JSON.stringify(dados));
    },
    removerDados(chave) {
        localStorage.removeItem(chave);
    }
};

window.CONFIG = CONFIG;
window.Utils = Utils;
