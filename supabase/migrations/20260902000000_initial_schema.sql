-- FinanzasAI Initial Migration
-- Version: 20260902000000

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TIPOS ENUM
-- ==========================================
CREATE TYPE public.workspace_type AS ENUM ('personal', 'family', 'team');
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE public.account_type AS ENUM ('bank', 'cash', 'credit_card', 'loan', 'savings', 'investment', 'other');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense', 'transfer', 'card_payment', 'loan_payment', 'adjustment');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE public.entry_direction AS ENUM ('debit', 'credit');
CREATE TYPE public.recurrence_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- ==========================================
-- 2. PERFILES DE USUARIO
-- ==========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"theme": "system", "currency": "USD"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger automático para crear perfil al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. WORKSPACES Y MIEMBROS
-- ==========================================
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type public.workspace_type NOT NULL DEFAULT 'personal',
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.workspace_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id)
);

CREATE TABLE public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.workspace_role NOT NULL DEFAULT 'editor',
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by UUID NOT NULL REFERENCES public.profiles(id),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4. CATEGORÍAS
-- ==========================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. CUENTAS, TARJETAS Y PRÉSTAMOS
-- ==========================================
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type public.account_type NOT NULL,
    institution TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.account_credit_cards (
    account_id UUID PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
    credit_limit NUMERIC(15, 2) NOT NULL CHECK (credit_limit >= 0),
    closing_day INT CHECK (closing_day BETWEEN 1 AND 31),
    due_day INT CHECK (due_day BETWEEN 1 AND 31)
);

CREATE TABLE public.account_loans (
    account_id UUID PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
    principal_amount NUMERIC(15, 2) NOT NULL CHECK (principal_amount > 0),
    interest_rate NUMERIC(5, 2) NOT NULL CHECK (interest_rate >= 0),
    monthly_installment NUMERIC(15, 2) CHECK (monthly_installment >= 0),
    start_date DATE NOT NULL,
    end_date DATE
);

-- ==========================================
-- 6. IMPORTACIONES Y STAGING
-- ==========================================
CREATE TABLE public.import_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    file_name TEXT,
    status TEXT NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 7. LEDGER CENTRALIZADO
-- ==========================================
CREATE TABLE public.ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    type public.transaction_type NOT NULL,
    status public.transaction_status NOT NULL DEFAULT 'confirmed',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    merchant TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    import_session_id UUID REFERENCES public.import_sessions(id) ON DELETE SET NULL,
    is_recurring_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES public.ledger_transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    direction public.entry_direction NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.import_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_session_id UUID NOT NULL REFERENCES public.import_sessions(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    raw_amount NUMERIC(15, 2) NOT NULL,
    suggested_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_possible_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate_reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 8. RECURRENCIAS Y PRESUPUESTOS
-- ==========================================
CREATE TABLE public.recurring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount <> 0),
    type public.transaction_type NOT NULL,
    description TEXT NOT NULL,
    frequency public.recurrence_frequency NOT NULL,
    next_run_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_workspace_category_period UNIQUE (workspace_id, category_id, month, year)
);

-- ==========================================
-- 9. CONFIGURACIÓN IA, CHAT Y NOTIFICACIONES
-- ==========================================
CREATE TABLE public.workspace_ai_settings (
    workspace_id UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    encrypted_gemini_key TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nueva conversación',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 10. ÍNDICES DE ALTO RENDIMIENTO
-- ==========================================
CREATE INDEX idx_ledger_tx_ws_date ON public.ledger_transactions (workspace_id, transaction_date DESC);
CREATE INDEX idx_ledger_entries_account ON public.ledger_entries (account_id);
CREATE INDEX idx_ledger_entries_tx ON public.ledger_entries (transaction_id);
CREATE INDEX idx_ws_members_user_ws ON public.workspace_members (user_id, workspace_id);
CREATE INDEX idx_recurring_rules_next_run ON public.recurring_rules (workspace_id, next_run_date) WHERE is_active = TRUE;

-- ==========================================
-- 11. FUNCIONES AUXILIARES Y DE SEGURIDAD
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_user_workspace_role(target_workspace_id UUID)
RETURNS public.workspace_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role 
    FROM public.workspace_members 
    WHERE workspace_id = target_workspace_id 
      AND user_id = auth.uid();
$$;

-- Procedimiento atómico reforzado para transacciones financieras
CREATE OR REPLACE FUNCTION public.fn_create_financial_transaction(
    p_workspace_id UUID,
    p_type public.transaction_type,
    p_description TEXT,
    p_transaction_date DATE,
    p_category_id UUID,
    p_merchant TEXT,
    p_entries JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_user_role public.workspace_role;
    v_tx_id UUID;
    v_entry JSONB;
    v_entry_account_id UUID;
    v_entry_amount NUMERIC(15, 2);
    v_entry_currency VARCHAR(3);
    v_total_sum NUMERIC(15, 2) := 0;
    v_entry_count INT := 0;
    v_account_ws_id UUID;
    v_cat_ws_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Usuario no autenticado.' USING ERRCODE = '42501';
    END IF;

    SELECT role INTO v_user_role
    FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = v_user_id;

    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'FORBIDDEN: El usuario no pertenece al workspace especificado.' USING ERRCODE = '42501';
    END IF;

    IF v_user_role NOT IN ('owner', 'admin', 'editor') THEN
        RAISE EXCEPTION 'FORBIDDEN: Permisos insuficientes para registrar transacciones en este workspace.' USING ERRCODE = '42501';
    END IF;

    IF p_description IS NULL OR trim(p_description) = '' THEN
        RAISE EXCEPTION 'INVALID_INPUT: La descripción de la transacción es obligatoria.' USING ERRCODE = '22023';
    END IF;

    IF p_transaction_date IS NULL THEN
        RAISE EXCEPTION 'INVALID_INPUT: La fecha de la transacción es obligatoria.' USING ERRCODE = '22023';
    END IF;

    IF p_category_id IS NOT NULL THEN
        SELECT workspace_id INTO v_cat_ws_id
        FROM public.categories
        WHERE id = p_category_id;

        IF v_cat_ws_id IS NULL OR v_cat_ws_id <> p_workspace_id THEN
            RAISE EXCEPTION 'INVALID_RELATION: La categoría especificada no pertenece al workspace.' USING ERRCODE = '22023';
        END IF;
    END IF;

    IF p_entries IS NULL OR jsonb_array_length(p_entries) = 0 THEN
        RAISE EXCEPTION 'INVALID_INPUT: La transacción debe contener al menos una partida.' USING ERRCODE = '22023';
    END IF;

    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
        v_entry_account_id := (v_entry->>'account_id')::UUID;
        v_entry_amount := (v_entry->>'amount')::NUMERIC(15, 2);
        v_entry_currency := COALESCE(v_entry->>'currency', 'USD');

        IF v_entry_account_id IS NULL OR v_entry_amount IS NULL OR v_entry_amount = 0 THEN
            RAISE EXCEPTION 'INVALID_ENTRY: Cada partida debe especificar account_id y un monto distinto de cero.' USING ERRCODE = '22023';
        END IF;

        SELECT workspace_id INTO v_account_ws_id
        FROM public.accounts
        WHERE id = v_entry_account_id;

        IF v_account_ws_id IS NULL OR v_account_ws_id <> p_workspace_id THEN
            RAISE EXCEPTION 'SECURITY_VIOLATION: La cuenta % no pertenece al workspace %.', v_entry_account_id, p_workspace_id USING ERRCODE = '42501';
        END IF;

        v_total_sum := v_total_sum + v_entry_amount;
        v_entry_count := v_entry_count + 1;
    END LOOP;

    IF p_type IN ('transfer', 'card_payment') THEN
        IF v_entry_count < 2 THEN
            RAISE EXCEPTION 'FINANCIAL_RULE_VIOLATION: Operación de tipo % requiere al menos 2 cuentas.', p_type USING ERRCODE = '22023';
        END IF;
        IF v_total_sum <> 0 THEN
            RAISE EXCEPTION 'FINANCIAL_RULE_VIOLATION: En %, las partidas deben cuadrar a cero (Suma actual: %).', p_type, v_total_sum USING ERRCODE = '22023';
        END IF;
    ELSIF p_type = 'income' AND v_total_sum <= 0 THEN
        RAISE EXCEPTION 'FINANCIAL_RULE_VIOLATION: Un ingreso debe tener un monto positivo neto.' USING ERRCODE = '22023';
    ELSIF p_type = 'expense' AND v_total_sum >= 0 THEN
        RAISE EXCEPTION 'FINANCIAL_RULE_VIOLATION: Un gasto debe tener un monto negativo neto.' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.ledger_transactions (
        workspace_id, created_by, type, description, transaction_date, category_id, merchant, status
    ) VALUES (
        p_workspace_id, v_user_id, p_type, trim(p_description), p_transaction_date, p_category_id, p_merchant, 'confirmed'
    ) RETURNING id INTO v_tx_id;

    FOR v_entry IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
        v_entry_account_id := (v_entry->>'account_id')::UUID;
        v_entry_amount := (v_entry->>'amount')::NUMERIC(15, 2);
        v_entry_currency := COALESCE(v_entry->>'currency', 'USD');

        INSERT INTO public.ledger_entries (
            transaction_id, account_id, amount, currency, direction
        ) VALUES (
            v_tx_id,
            v_entry_account_id,
            v_entry_amount,
            v_entry_currency,
            CASE WHEN v_entry_amount > 0 THEN 'credit'::public.entry_direction ELSE 'debit'::public.entry_direction END
        );
    END LOOP;

    RETURN v_tx_id;
END;
$$;

-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas Profiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Políticas Workspaces
CREATE POLICY "Miembros pueden ver sus workspaces" ON public.workspaces FOR SELECT USING (public.get_user_workspace_role(id) IS NOT NULL);
CREATE POLICY "Usuarios pueden crear workspaces" ON public.workspaces FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Owners pueden actualizar workspaces" ON public.workspaces FOR UPDATE USING (public.get_user_workspace_role(id) = 'owner');

-- Políticas Workspace Members
CREATE POLICY "Miembros pueden ver miembros de su workspace" ON public.workspace_members FOR SELECT USING (public.get_user_workspace_role(workspace_id) IS NOT NULL);
CREATE POLICY "Admins/Owners pueden gestionar miembros" ON public.workspace_members FOR ALL USING (public.get_user_workspace_role(workspace_id) IN ('owner', 'admin'));

-- Políticas Accounts
CREATE POLICY "Miembros pueden ver cuentas del workspace" ON public.accounts FOR SELECT USING (public.get_user_workspace_role(workspace_id) IS NOT NULL);
CREATE POLICY "Editors y superiores pueden gestionar cuentas" ON public.accounts FOR ALL USING (public.get_user_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'));

-- Políticas Credit Cards y Loans
CREATE POLICY "Miembros pueden ver credit cards" ON public.account_credit_cards FOR SELECT USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_credit_cards.account_id AND public.get_user_workspace_role(a.workspace_id) IS NOT NULL));
CREATE POLICY "Editors y superiores pueden gestionar credit cards" ON public.account_credit_cards FOR ALL USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_credit_cards.account_id AND public.get_user_workspace_role(a.workspace_id) IN ('owner', 'admin', 'editor')));

CREATE POLICY "Miembros pueden ver loans" ON public.account_loans FOR SELECT USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_loans.account_id AND public.get_user_workspace_role(a.workspace_id) IS NOT NULL));
CREATE POLICY "Editors y superiores pueden gestionar loans" ON public.account_loans FOR ALL USING (EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = account_loans.account_id AND public.get_user_workspace_role(a.workspace_id) IN ('owner', 'admin', 'editor')));

-- Políticas Categories
CREATE POLICY "Miembros pueden ver categorías" ON public.categories FOR SELECT USING (public.get_user_workspace_role(workspace_id) IS NOT NULL);
CREATE POLICY "Editors y superiores pueden gestionar categorías" ON public.categories FOR ALL USING (public.get_user_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'));

-- Políticas Ledger Transactions & Entries (Lectura autorizada, sin INSERT/UPDATE directo desde cliente)
CREATE POLICY "Miembros pueden ver transacciones del ledger" ON public.ledger_transactions FOR SELECT USING (public.get_user_workspace_role(workspace_id) IS NOT NULL);

CREATE POLICY "Miembros pueden ver entradas del ledger" ON public.ledger_entries FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.ledger_transactions tx
        WHERE tx.id = ledger_entries.transaction_id
          AND public.get_user_workspace_role(tx.workspace_id) IS NOT NULL
    )
);

-- Políticas Budgets
CREATE POLICY "Miembros pueden ver presupuestos" ON public.budgets FOR SELECT USING (public.get_user_workspace_role(workspace_id) IS NOT NULL);
CREATE POLICY "Editors y superiores pueden gestionar presupuestos" ON public.budgets FOR ALL USING (public.get_user_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'));

-- Políticas AI Settings
CREATE POLICY "Admins y owners pueden ver AI settings" ON public.workspace_ai_settings FOR SELECT USING (public.get_user_workspace_role(workspace_id) IN ('owner', 'admin'));
CREATE POLICY "Admins y owners pueden gestionar AI settings" ON public.workspace_ai_settings FOR ALL USING (public.get_user_workspace_role(workspace_id) IN ('owner', 'admin'));

-- Políticas Notifications
CREATE POLICY "Usuarios pueden ver sus notificaciones" ON public.notifications FOR SELECT USING (user_id = auth.uid() OR public.get_user_workspace_role(workspace_id) IS NOT NULL);
CREATE POLICY "Usuarios pueden actualizar sus notificaciones" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
