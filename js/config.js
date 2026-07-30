// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================
// Substitua pelas suas credenciais do Supabase
// Dashboard > Settings > API

const SUPABASE_CONFIG = {
    url: 'https://SEU-PROJETO.supabase.co',
    anonKey: 'SUA-CHAVE-ANON-AQUI'
};

// Inicializar Supabase
const supabase = window.supabase ? window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
) : null;

// ============================================
// CONSTANTES DO SISTEMA
// ============================================

const CONFIG = {
    // Nome da aplicação
    APP_NAME: 'BarberBook',
    
    // Versão
    VERSION: '1.0.0',
    
    // Dias da semana
    DIAS_SEMANA: {
        0: 'Domingo',
        1: 'Segunda-feira',
        2: 'Terça-feira',
        3: 'Quarta-feira',
        4: 'Quinta-feira',
        5: 'Sexta-feira',
        6: 'Sábado'
    },
    
    // Status dos agendamentos
    STATUS_AGENDAMENTO: {
        PENDENTE: 'pendente',
        CONFIRMADO: 'confirmado',
        CONCLUIDO: 'concluido',
        CANCELADO: 'cancelado'
    },
    
    // Cores dos status
    STATUS_CORES: {
        pendente: '#f59e0b',
        confirmado: '#10b981',
        concluido: '#6366f1',
        cancelado: '#ef4444'
    },
    
    // Duração padrão dos intervalos (em minutos)
    INTERVALO_PADRAO: 15,
    
    // Horário de funcionamento padrão
    HORARIO_PADRAO: {
        inicio: '09:00',
        fim: '19:00'
    },
    
    // Máximo de agendamentos por dia por barbeiro
    MAX_AGENDAMENTOS_DIA: 20,
    
    // Antecedência mínima para agendar (em horas)
    ANTECEDENCIA_MINIMA: 1,
    
    // Antecedência máxima para agendar (em dias)
    ANTECEDENCIA_MAXIMA: 30,
    
    // Configurações de notificação
    NOTIFICACOES: {
        CONFIRMACAO: true,
        LEMBRETE_24H: true,
        LEMBRETE_1H: true,
        CANCELAMENTO: true
    },
    
    // URLs de redirecionamento
    URLS: {
        HOME: '/',
        LOGIN: '/login.html',
        CADASTRO: '/cadastro.html',
        AGENDAR: '/agendar.html',
        PERFIL: '/perfil.html',
        ADMIN: '/admin/',
        BARBEIRO: '/barbeiro/',
        AGENDAMENTO_CONFIRMADO: '/agendamento-confirmado.html'
    }
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

const Utils = {
    // Formatar data para exibição
    formatarData(data) {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        };
        return new Date(data).toLocaleDateString('pt-BR', options);
    },
    
    // Formatar hora para exibição
    formatarHora(hora) {
        return hora.substring(0, 5);
    },
    
    // Formatar moeda
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },
    
    // Obter dia da semana
    obterDiaSemana(data) {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return dias[new Date(data).getDay()];
    },
    
    // Validar email
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // Validar telefone
    validarTelefone(telefone) {
        const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return regex.test(telefone);
    },
    
    // Formatar telefone
    formatarTelefone(telefone) {
        const numeros = telefone.replace(/\D/g, '');
        if (numeros.length === 11) {
            return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
        }
        return telefone;
    },
    
    // Gerar ID único
    gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Mostrar notificação toast
    mostrarToast(mensagem, tipo = 'sucesso', duracao = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <span class="toast-icon">${tipo === 'sucesso' ? '✓' : tipo === 'erro' ? '✕' : 'ℹ'}</span>
            <span class="toast-mensagem">${mensagem}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('mostrar'), 10);
        setTimeout(() => {
            toast.classList.remove('mostrar');
            setTimeout(() => toast.remove(), 300);
        }, duracao);
    },
    
    // Carregar dados do localStorage
    carregarDados(chave) {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : null;
    },
    
    // Salvar dados no localStorage
    salvarDados(chave, dados) {
        localStorage.setItem(chave, JSON.stringify(dados));
    },
    
    // Remover dados do localStorage
    removerDados(chave) {
        localStorage.removeItem(chave);
    }
};

// Exportar para uso global
window.CONFIG = CONFIG;
window.Utils = Utils;
