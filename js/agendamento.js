const appointmentState = { step: 1, service: null, barber: null, date: null, time: null, observations: '' };
let currentDate = new Date();
let selectedDate = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    checkUserLogin();
    loadServices();
    loadBarbers();
});

function checkUserLogin() {
    const user = Utils.carregarDados('user');
    const loginPrompt = document.getElementById('loginPrompt');
    const confirmBtn = document.getElementById('confirmBtn');
    if (user && loginPrompt) { loginPrompt.style.display = 'none'; if (confirmBtn) confirmBtn.disabled = false; }
}

async function loadServices() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('servicos').select('*').eq('ativo', true).order('preco');
        if (error) throw error;
        if (data && data.length > 0) {
            const container = document.getElementById('servicesList');
            if (!container) return;
            const icons = { 'corte': 'âœ‚', 'barba': 'ðŸ§”', 'combo': 'ðŸ’ˆ', 'pigmentaÃ§Ã£o': 'ðŸŽ¨', 'hidrataÃ§Ã£o': 'ðŸ’†', 'infantil': 'ðŸ‘¦' };
            container.innerHTML = data.map(s => {
                const lower = s.nome.toLowerCase();
                let icon = 'âœ‚';
                for (const [k, v] of Object.entries(icons)) { if (lower.includes(k)) { icon = v; break; } }
                return '<div class="service-card" data-service="' + s.id + '" onclick="selectService(this)"><div class="service-icon">' + icon + '</div><h3 class="service-name">' + s.nome + '</h3><p class="service-description">' + (s.descricao || '') + '</p><div class="service-price">R$ ' + parseFloat(s.preco).toFixed(2).replace('.', ',') + '</div><div class="service-duration">' + s.duracao_minutos + ' minutos</div></div>';
            }).join('');
        }
    } catch (error) { console.error('Erro ao carregar serviÃ§os:', error); }
}

async function loadBarbers() {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('barbeiros').select('*').eq('ativo', true);
        if (error) throw error;
        if (data && data.length > 0) {
            const container = document.getElementById('barbersList');
            if (!container) return;
            container.innerHTML = data.map(b => '<div class="barber-card" data-barber="' + b.id + '" onclick="selectBarber(this)"><img src="' + (b.foto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200') + '" alt="' + b.nome + '" class="barber-avatar"><h3 class="barber-name">' + b.nome + '</h3><p class="barber-specialty">' + (b.especialidade || 'Barbeiro Profissional') + '</p><div class="barber-rating"><span>â­</span><span>' + (b.rating || '4.8') + '</span></div></div>').join('');
        }
    } catch (error) { console.error('Erro ao carregar barbeiros:', error); }
}

function nextStep(step) {
    if (!validateCurrentStep()) return;
    document.querySelector('.step-content.active').classList.remove('active');
    document.querySelector('.step-content.active').classList.add('hidden');
    document.getElementById('step' + step).classList.remove('hidden');
    document.getElementById('step' + step).classList.add('active');
    updateStepsIndicator(step);
    appointmentState.step = step;
    if (step === 5) updateSummary();
    if (step === 4) loadAvailableTimes();
}

function prevStep(step) {
    document.querySelector('.step-content.active').classList.remove('active');
    document.querySelector('.step-content.active').classList.add('hidden');
    document.getElementById('step' + step).classList.remove('hidden');
    document.getElementById('step' + step).classList.add('active');
    updateStepsIndicator(step);
    appointmentState.step = step;
}

function updateStepsIndicator(currentStep) {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentStep) step.classList.add('active');
        else if (index + 1 < currentStep) step.classList.add('completed');
    });
}

function validateCurrentStep() {
    switch (appointmentState.step) {
        case 1: if (!appointmentState.service) { Utils.mostrarToast('Selecione um serviÃ§o', 'erro'); return false; } return true;
        case 2: if (!appointmentState.barber) { Utils.mostrarToast('Selecione um barbeiro', 'erro'); return false; } return true;
        case 3: if (!appointmentState.date) { Utils.mostrarToast('Selecione uma data', 'erro'); return false; } return true;
        case 4: if (!appointmentState.time) { Utils.mostrarToast('Selecione um horÃ¡rio', 'erro'); return false; } return true;
        default: return true;
    }
}

function selectService(element) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    appointmentState.service = { id: element.dataset.service, name: element.querySelector('.service-name').textContent, price: element.querySelector('.service-price').textContent, duration: element.querySelector('.service-duration').textContent };
    document.getElementById('nextStep1').disabled = false;
}

function selectBarber(element) {
    document.querySelectorAll('.barber-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    appointmentState.barber = { id: element.dataset.barber, name: element.querySelector('.barber-name').textContent, specialty: element.querySelector('.barber-specialty').textContent };
    document.getElementById('nextStep2').disabled = false;
}

function initializeDatePicker() { renderDatePicker(); }
function changeMonth(delta) { currentDate.setMonth(currentDate.getMonth() + delta); renderDatePicker(); }

function renderDatePicker() {
    const picker = document.getElementById('datePicker');
    const monthLabel = document.getElementById('currentMonth');
    if (!picker || !monthLabel) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['Janeiro', 'Fevereiro', 'MarÃ§o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    monthLabel.textContent = monthNames[month] + ' ' + year;
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<div class="date-item disabled"></div>';
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
        const isSunday = date.getDay() === 0;
        let cls = 'date-item';
        if (isPast || isSunday) cls += ' disabled';
        if (isToday) cls += ' today';
        if (isSelected) cls += ' selected';
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'];
        html += '<div class="' + cls + '" data-date="' + date.toISOString() + '" onclick="selectDate(this)"><span class="date-day">' + dayNames[date.getDay()] + '</span><span class="date-number">' + day + '</span></div>';
    }
    picker.innerHTML = html;
}

function selectDate(element) {
    if (element.classList.contains('disabled')) return;
    document.querySelectorAll('.date-item').forEach(i => i.classList.remove('selected'));
    element.classList.add('selected');
    appointmentState.date = new Date(element.dataset.date);
    selectedDate = appointmentState.date;
    document.getElementById('nextStep3').disabled = false;
}

async function loadAvailableTimes() {
    if (!supabase || !appointmentState.date || !appointmentState.barber) return;
    const container = document.getElementById('timeSlots');
    const dateDisplay = document.getElementById('selectedDateDisplay');
    if (!container) return;
    if (dateDisplay) dateDisplay.textContent = Utils.formatarData(appointmentState.date);
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">Carregando horÃ¡rios...</div>';
    try {
        const dateStr = appointmentState.date.toISOString().split('T')[0];
        const { data: existing } = await supabase.from('agendamentos').select('horario').eq('barbeiro_id', appointmentState.barber.id).eq('data', dateStr).in('status', ['pendente', 'confirmado']);
        const bookedTimes = (existing || []).map(a => a.horario);
        const { data: sched } = await supabase.from('horarios_barbeiros').select('*').eq('barbeiro_id', appointmentState.barber.id).eq('dia_semana', appointmentState.date.getDay());
        let openingHour = 9, closingHour = 19;
        if (sched && sched.length > 0) { openingHour = parseInt(sched[0].hora_inicio.split(':')[0]); closingHour = parseInt(sched[0].hora_fim.split(':')[0]); }
        let html = '';
        for (let h = openingHour; h < closingHour; h++) {
            for (let m = 0; m < 60; m += 30) {
                const time = h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
                const isBooked = bookedTimes.includes(time);
                html += '<div class="time-slot ' + (isBooked ? 'disabled' : '') + '" data-time="' + time + '" onclick="selectTime(this)">' + time + '</div>';
            }
        }
        container.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar horÃ¡rios:', error);
        let html = '';
        for (let h = 9; h < 19; h++) { for (let m = 0; m < 60; m += 30) { const t = h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0'); html += '<div class="time-slot" data-time="' + t + '" onclick="selectTime(this)">' + t + '</div>'; } }
        container.innerHTML = html;
    }
}

function selectTime(element) {
    if (element.classList.contains('disabled')) return;
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    appointmentState.time = element.dataset.time;
    document.getElementById('nextStep4').disabled = false;
}

function updateSummary() {
    document.getElementById('summaryService').textContent = appointmentState.service?.name || '-';
    document.getElementById('summaryBarber').textContent = appointmentState.barber?.name || '-';
    document.getElementById('summaryDate').textContent = appointmentState.date ? Utils.formatarData(appointmentState.date) : '-';
    document.getElementById('summaryTime').textContent = appointmentState.time || '-';
    document.getElementById('summaryPrice').textContent = appointmentState.service?.price || '-';
}

async function confirmAppointment() {
    const user = Utils.carregarDados('user');
    if (!user) { Utils.mostrarToast('FaÃ§a login para confirmar o agendamento', 'erro'); return; }
    const btn = document.getElementById('confirmBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="loading"></span> Confirmando...'; btn.disabled = true;
    try {
        if (!supabase) throw new Error('Supabase nÃ£o configurado');
        const dateStr = appointmentState.date.toISOString().split('T')[0];
        const appointmentData = {
            usuario_id: user.id, barbeiro_id: appointmentState.barber.id, servico_id: appointmentState.service.id,
            data: dateStr, horario: appointmentState.time,
            observacoes: document.getElementById('observations')?.value || '',
            status: 'pendente',
            valor_total: parseFloat(appointmentState.service.price.replace('R$ ', '').replace(',', '.'))
        };
        const { data, error } = await supabase.from('agendamentos').insert(appointmentData).select().single();
        if (error) throw error;
        document.getElementById('appointmentCode').textContent = data.id.substring(0, 8).toUpperCase();
        document.getElementById('confirmationModal').classList.add('active');
        appointmentState.step = 1; appointmentState.service = null; appointmentState.barber = null;
        appointmentState.date = null; appointmentState.time = null; appointmentState.observations = '';
        document.querySelectorAll('.service-card, .barber-card').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.btn').forEach(b => { if (b.id && b.id.startsWith('nextStep')) b.disabled = true; });
    } catch (error) {
        console.error('Erro ao agendar:', error);
        Utils.mostrarToast(error.message || 'Erro ao confirmar agendamento', 'erro');
        btn.innerHTML = orig; btn.disabled = false;
    }
}

window.appointment = { state: appointmentState, selectService, selectBarber, selectDate, selectTime, confirmAppointment };
