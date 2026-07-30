-- ============================================
-- BARBERBOOK - SCRIPT SQL PARA SUPABASE
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- TABELA DE BARBEARIAS
-- ============================================

CREATE TABLE IF NOT EXISTS barbearias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    horario_abertura TIME DEFAULT '09:00',
    horario_fecho TIME DEFAULT '19:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA DE USUÁRIOS (estende auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    avatar TEXT,
    role VARCHAR(20) DEFAULT 'cliente' CHECK (role IN ('admin', 'barbeiro', 'cliente')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA DE BARBEIROS
-- ============================================

CREATE TABLE IF NOT EXISTS barbeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE,
    especialidade TEXT,
    bio TEXT,
    foto TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA DE SERVIÇOS
-- ============================================

CREATE TABLE IF NOT EXISTS servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    preco DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA DE HORÁRIOS DOS BARBEIROS
-- ============================================

CREATE TABLE IF NOT EXISTS horarios_barbeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbeiro_id UUID REFERENCES barbeiros(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barbeiro_id, dia_semana)
);

-- ============================================
-- TABELA DE AGENDAMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    barbeiro_id UUID REFERENCES barbeiros(id) ON DELETE CASCADE,
    servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE,
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'concluido', 'cancelado')),
    observacoes TEXT,
    valor_total DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA DE NOTIFICAÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(100),
    mensagem TEXT,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_barbeiro ON agendamentos(barbeiro_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbeiros_updated_at
    BEFORE UPDATE ON barbeiros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
    BEFORE UPDATE ON servicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_barbeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbearias ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Usuarios podem ver seu próprio perfil"
    ON usuarios FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar seu próprio perfil"
    ON usuarios FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para agendamentos
CREATE POLICY "Clientes podem ver seus próprios agendamentos"
    ON agendamentos FOR SELECT
    USING (
        cliente_id = auth.uid() OR
        barbeiro_id IN (SELECT id FROM barbeiros WHERE usuario_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Clientes podem criar agendamentos"
    ON agendamentos FOR INSERT
    WITH CHECK (cliente_id = auth.uid());

CREATE POLICY "Clientes podem cancelar seus agendamentos"
    ON agendamentos FOR UPDATE
    USING (
        cliente_id = auth.uid() OR
        barbeiro_id IN (SELECT id FROM barbeiros WHERE usuario_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para barbeiros
CREATE POLICY "Barbeiros são visíveis para todos"
    ON barbeiros FOR SELECT
    USING (true);

CREATE POLICY "Admin pode gerenciar barbeiros"
    ON barbeiros FOR ALL
    USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para serviços
CREATE POLICY "Serviços são visíveis para todos"
    ON servicos FOR SELECT
    USING (true);

CREATE POLICY "Admin pode gerenciar serviços"
    ON servicos FOR ALL
    USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para notificações
CREATE POLICY "Usuarios podem ver suas notificações"
    ON notificacoes FOR SELECT
    USING (usuario_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações"
    ON notificacoes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuarios podem marcar notificações como lidas"
    ON notificacoes FOR UPDATE
    USING (usuario_id = auth.uid());

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir barbearia padrão
INSERT INTO barbearias (nome, endereco, telefone, email) VALUES
('BarberBook Barbearia', 'Rua Example, 123 - Centro', '(11) 99999-9999', 'contato@barberbook.com');

-- Inserir serviços padrão
INSERT INTO servicos (barbearia_id, nome, descricao, duracao_minutos, preco) VALUES
((SELECT id FROM barbearias LIMIT 1), 'Corte Masculino', 'Corte moderno ou clássico', 30, 45.00),
((SELECT id FROM barbearias LIMIT 1), 'Barba', 'Barba com navalha e toalha quente', 25, 35.00),
((SELECT id FROM barbearias LIMIT 1), 'Combo Corte + Barba', 'O pacote completo', 50, 70.00),
((SELECT id FROM barbearias LIMIT 1), 'Pigmentação', 'Cobertura ou design', 40, 60.00),
((SELECT id FROM barbearias LIMIT 1), 'Hidratação', 'Tratamento capilar profundo', 35, 50.00),
((SELECT id FROM barbearias LIMIT 1), 'Corte Infantil', 'Para crianças', 25, 35.00);

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE barbearias IS 'Tabela de barbearias cadastradas';
COMMENT ON TABLE usuarios IS 'Tabela de usuários estendida do auth';
COMMENT ON TABLE barbeiros IS 'Tabela de barbeiros vinculados às barbearias';
COMMENT ON TABLE servicos IS 'Serviços oferecidos pelas barbearias';
COMMENT ON TABLE horarios_barbeiros IS 'Horários de disponibilidade dos barbeiros';
COMMENT ON TABLE agendamentos IS 'Agendamentos realizados pelos clientes';
COMMENT ON TABLE notificacoes IS 'Notificações do sistema';
