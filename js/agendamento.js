// ============================================
// SISTEMA DE AGENDAMENTO - BarberBook
// ============================================

// Estado do agendamento
const appointmentState = {
    step: 1,
    service: null,
    barber: null,
    date: null,
    time: null,
    observations: ''
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    checkUserLogin();
});

function checkUserLogin() {
    const user = Utils.carregarDados('user');
    const loginPrompt = document.getElementById('loginPrompt');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (user && loginPrompt) {
        loginPrompt.style.display = 'none';
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }
}

// ============================================
// NAVEGAÇÃO ENTRE PASSOS
// ============================================

function nextStep(step) {
    // Validar passo atual
    if (!validateCurrentStep()) {
        return;
    }
    
    // Esconder passo atual
    document.querySelector('.step-content.active').classList.remove('active');
    document.querySelector('.step-content.active').classList.add('hidden');
    
    // Mostrar próximo passo
    document.getElementById(`step${step}`).classList.remove('hidden');
    document.getElementById(`step${step}`).classList.add('active');
    
    // Atualizar steps indicator
    updateStepsIndicator(step);
    
    // Atualizar estado
    appointmentState.step = step;
    
    // Ações específicas por passo
    if (step === 5) {
        updateSummary();
    }
}

function prevStep(step) {
    // Esconder passo atual
    document.querySelector('.step-content.active').classList.remove('active');
    document.querySelector('.step-content.active').classList.add('hidden');
    
    // Mostrar passo anterior
    document.getElementById(`step${step}`).classList.remove('hidden');
    document.getElementById(`step${step}`).classList.add('active');
    
    // Atualizar steps indicator
    updateStepsIndicator(step);
    
    // Atualizar estado
    appointmentState.step = step;
}

function updateStepsIndicator(currentStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
}

function validateCurrentStep() {
    switch (appointmentState.step) {
        case 1:
            if (!appointmentState.service) {
                Utils.mostrarToast('Selecione um serviço', 'erro');
                return false;
            }
            return true;
        case 2:
            if (!appointmentState.barber) {
                Utils.mostrarToast('Selecione um barbeiro', 'erro');
                return false;
            }
            return true;
        case 3:
            if (!appointmentState.date) {
                Utils.mostrarToast('Selecione uma data', 'erro');
                return false;
            }
            return true;
        case 4:
            if (!appointmentState.time) {
                Utils.mostrarToast('Selecione um horário', 'erro');
                return false;
            }
            return true;
        default:
            return true;
    }
}

// ============================================
// SELEÇÃO DE SERVIÇO
// ============================================

function selectService(element) {
    // Remover seleção anterior
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Selecionar novo
    element.classList.add('selected');
    
    // Salvar no estado
    appointmentState.service = {
        id: element.dataset.service,
        name: element.querySelector('.service-name').textContent,
        price: element.querySelector('.service-price').textContent,
        duration: element.querySelector('.service-duration').textContent
    };
    
    // Habilitar botão próximo
    document.getElementById('nextStep1').disabled = false;
}

// ============================================
// SELEÇÃO DE BARBEIRO
// ============================================

function selectBarber(element) {
    // Remover seleção anterior
    document.querySelectorAll('.barber-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Selecionar novo
    element.classList.add('selected');
    
    // Salvar no estado
    appointmentState.barber = {
        id: element.dataset.barber,
        name: element.querySelector('.barber-name').textContent,
        specialty: element.querySelector('.barber-specialty').textContent
    };
    
    // Habilitar botão próximo
    document.getElementById('nextStep2').disabled = false;
}

// ============================================
// SELEÇÃO DE DATA
// ============================================

let currentDate = new Date();
let selectedDate = null;

function initializeDatePicker() {
    renderDatePicker();
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderDatePicker();
}

function renderDatePicker() {
    const picker = document.getElementById('datePicker');
    const monthLabel = document.getElementById('currentMonth');
    
    if (!picker || !monthLabel) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Atualizar label do mês
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    monthLabel.textContent = `${monthNames[month]} ${year}`;
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Data de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Gerar dias
    let html = '';
    
    // Dias vazios no início
    for (let i = 0; i < startingDay; i++) {
        html += '<div class="date-item disabled"></div>';
    }
    
    // Dias do mês
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
        const isSunday = date.getDay() === 0;
        
        let classes = 'date-item';
        if (isPast || isSunday) classes += ' disabled';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        html += `
            <div class="${classes}" data-date="${date.toISOString()}" onclick="selectDate(this)">
                <span class="date-day">${dayNames[date.getDay()]}</span>
                <span class="date-number">${day}</span>
            </div>
        `;
    }
    
    picker.innerHTML = html;
}

function selectDate(element) {
    if (element.classList.contains('disabled')) {
        return;
    }
    
    // Remover seleção anterior
    document.querySelectorAll('.date-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Selecionar novo
    element.classList.add('selected');
    
    // Salvar no estado
    appointmentState.date = new Date(element.dataset.date);
    selectedDate = appointmentState.date;
    
    // Gerar horários disponíveis
    generateTimeSlots();
    
    // Habilitar botão próximo
    document.getElementById('nextStep3').disabled = false;
}

// ============================================
// SELEÇÃO DE HORÁRIO
// ============================================

function generateTimeSlots() {
    const container = document.getElementById('timeSlots');
    const dateDisplay = document.getElementById('selectedDateDisplay');
    
    if (!container) return;
    
    // Atualizar display da data
    if (dateDisplay) {
        dateDisplay.textContent = Utils.formatarData(appointmentState.date);
    }
    
    // Horários de funcionamento
    const openingHour = 9;
    const closingHour = 19;
    const interval = 30; // minutos
    
    let html = '';
    
    for (let hour = openingHour; hour < closingHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isDisabled = isTimeUnavailable(time);
            
            html += `
                <div class="time-slot ${isDisabled ? 'disabled' : ''}" 
                     data-time="${time}" 
                     onclick="selectTime(this)">
                    ${time}
                </div>
            `;
        }
    }
    
    container.innerHTML = html;
}

function isTimeUnavailable(time) {
    // Simular alguns horários indisponíveis
    const unavailableTimes = ['10:00', '14:00', '16:30'];
    return unavailableTimes.includes(time);
}

function selectTime(element) {
    if (element.classList.contains('disabled')) {
        return;
    }
    
    // Remover seleção anterior
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Selecionar novo
    element.classList.add('selected');
    
    // Salvar no estado
    appointmentState.time = element.dataset.time;
    
    // Habilitar botão próximo
    document.getElementById('nextStep4').disabled = false;
}

// ============================================
// ATUALIZAR RESUMO
// ============================================

function updateSummary() {
    document.getElementById('summaryService').textContent = appointmentState.service?.name || '-';
    document.getElementById('summaryBarber').textContent = appointmentState.barber?.name || '-';
    document.getElementById('summaryDate').textContent = appointmentState.date ? Utils.formatarData(appointmentState.date) : '-';
    document.getElementById('summaryTime').textContent = appointmentState.time || '-';
    document.getElementById('summaryPrice').textContent = appointmentState.service?.price || '-';
}

// ============================================
// CONFIRMAR AGENDAMENTO
// ============================================

async function confirmAppointment() {
    const user = Utils.carregarDados('user');
    
    if (!user) {
        Utils.mostrarToast('Faça login para confirmar o agendamento', 'erro');
        return;
    }
    
    const btn = document.getElementById('confirmBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> Confirmando...';
    btn.disabled = true;
    
    try {
        // Criar agendamento
        const appointment = {
            id: Utils.gerarId(),
            user_id: user.id,
            service: appointmentState.service,
            barber: appointmentState.barber,
            date: appointmentState.date.toISOString(),
            time: appointmentState.time,
            observations: document.getElementById('observations')?.value || '',
            status: 'pendente',
            created_at: new Date().toISOString()
        };
        
        // Salvar (substituir por Supabase)
        await saveAppointment(appointment);
        
        // Mostrar modal de confirmação
        document.getElementById('appointmentCode').textContent = appointment.id.toUpperCase();
        document.getElementById('confirmationModal').classList.add('active');
        
        // Limpar estado
        resetAppointmentState();
        
    } catch (error) {
        Utils.mostrarToast('Erro ao confirmar agendamento', 'erro');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function saveAppointment(appointment) {
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Salvar no localStorage (substituir por Supabase)
    const appointments = Utils.carregarDados('appointments') || [];
    appointments.push(appointment);
    Utils.salvarDados('appointments', appointments);
    
    return appointment;
}

function resetAppointmentState() {
    appointmentState.step = 1;
    appointmentState.service = null;
    appointmentState.barber = null;
    appointmentState.date = null;
    appointmentState.time = null;
    appointmentState.observations = '';
    
    // Reset UI
    document.querySelectorAll('.service-card, .barber-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.id && btn.id.startsWith('nextStep')) {
            btn.disabled = true;
        }
    });
}

// Exportar
window.appointment = {
    state: appointmentState,
    selectService,
    selectBarber,
    selectDate,
    selectTime,
    confirmAppointment
};
