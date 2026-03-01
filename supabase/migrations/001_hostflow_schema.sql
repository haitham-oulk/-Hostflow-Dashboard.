-- ============================================================
-- HOSTFLOW — Phase 2: Link (Supabase Database Schema)
-- Migration 001: Core tables, indexes, RLS
-- Generated: 2026-03-01
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROPERTIES (Biens locatifs)
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    address         TEXT,
    city            TEXT DEFAULT 'Marrakech',
    type            TEXT CHECK (type IN ('apartment', 'villa', 'riad', 'dar', 'other')) DEFAULT 'apartment',
    bedrooms        INTEGER DEFAULT 1,
    max_guests      INTEGER DEFAULT 2,
    cleaning_fee_mad DECIMAL(10, 2) DEFAULT 0,
    city_tax_per_night_mad DECIMAL(10, 2) DEFAULT 0,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE properties IS 'Biens locatifs gérés par Hostflow';
COMMENT ON COLUMN properties.cleaning_fee_mad IS 'Frais de ménage en MAD';
COMMENT ON COLUMN properties.city_tax_per_night_mad IS 'Taxe de séjour par nuit en MAD';

-- ============================================================
-- 2. GUESTS (Profils invités)
-- ============================================================
CREATE TABLE IF NOT EXISTS guests (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           TEXT NOT NULL,
    email               TEXT,
    phone               TEXT,
    nationality         TEXT,
    id_document_type    TEXT CHECK (id_document_type IN ('passport', 'cin', 'permit', 'other')),
    id_document_url     TEXT,
    marriage_cert_url   TEXT,
    compliance_status   TEXT CHECK (compliance_status IN ('pending', 'verified', 'incomplete', 'expired')) DEFAULT 'pending',
    notes               JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE guests IS 'Profils des invités avec documents de conformité';
COMMENT ON COLUMN guests.id_document_url IS 'URL vers le document d identité dans Supabase Storage';
COMMENT ON COLUMN guests.marriage_cert_url IS 'URL vers le certificat de mariage (si requis)';
COMMENT ON COLUMN guests.compliance_status IS 'Statut de conformité: pending, verified, incomplete, expired';

-- ============================================================
-- 3. BOOKINGS (Réservations)
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id             UUID REFERENCES properties(id) ON DELETE SET NULL,
    guest_id                UUID REFERENCES guests(id) ON DELETE SET NULL,
    platform                TEXT NOT NULL CHECK (platform IN ('airbnb', 'booking', 'direct')),
    check_in                DATE NOT NULL,
    check_out               DATE NOT NULL,
    nights                  INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
    num_guests              INTEGER DEFAULT 1,
    -- Financials
    gross_price_mad         DECIMAL(10, 2) NOT NULL DEFAULT 0,
    platform_commission_pct DECIMAL(5, 2) DEFAULT 0,
    platform_commission_mad DECIMAL(10, 2) GENERATED ALWAYS AS (gross_price_mad * platform_commission_pct / 100) STORED,
    cleaning_fee_mad        DECIMAL(10, 2) DEFAULT 0,
    city_tax_total_mad      DECIMAL(10, 2) DEFAULT 0,
    net_payout_mad          DECIMAL(10, 2) NOT NULL DEFAULT 0,
    -- Payout tracking
    payout_status           TEXT CHECK (payout_status IN ('pending', 'paid', 'overdue', 'partial')) DEFAULT 'pending',
    expected_payout_date    DATE,
    actual_payout_date      DATE,
    -- Source tracking
    source                  TEXT CHECK (source IN ('manual', 'csv_import', 'api')) DEFAULT 'manual',
    raw_csv_row             JSONB,
    hosted_names            TEXT,
    -- Metadata
    notes                   TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_dates CHECK (check_out > check_in)
);

COMMENT ON TABLE bookings IS 'Réservations centralisées (CSV, manuelles, API)';
COMMENT ON COLUMN bookings.nights IS 'Calculé automatiquement: check_out - check_in';
COMMENT ON COLUMN bookings.platform_commission_mad IS 'Calculé automatiquement: gross * commission_pct / 100';
COMMENT ON COLUMN bookings.source IS 'Origine de la réservation: manual, csv_import, api';

-- ============================================================
-- 4. PAYOUTS (Factures & Paiements)
-- ============================================================
CREATE TABLE IF NOT EXISTS payouts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id          UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount_mad          DECIMAL(10, 2) NOT NULL,
    amount_eur          DECIMAL(10, 2),
    exchange_rate       DECIMAL(10, 6),
    expected_amount_mad DECIMAL(10, 2),
    bank_fees_mad       DECIMAL(10, 2) DEFAULT 0,
    bank_fees_detected  BOOLEAN DEFAULT FALSE,
    invoice_pdf_url     TEXT,
    audit_status        TEXT CHECK (audit_status IN ('pending', 'verified', 'flagged', 'disputed')) DEFAULT 'pending',
    audit_notes         JSONB DEFAULT '{}'::jsonb,
    payout_date         DATE,
    platform            TEXT CHECK (platform IN ('airbnb', 'booking', 'direct')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payouts IS 'Suivi des paiements reçus et audit des factures';
COMMENT ON COLUMN payouts.bank_fees_mad IS 'Frais bancaires cachés détectés par comparaison EUR/MAD';
COMMENT ON COLUMN payouts.audit_status IS 'Résultat de l audit: pending, verified, flagged, disputed';

-- ============================================================
-- 5. EXPENSES (Dépenses opérationnelles)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id     UUID REFERENCES properties(id) ON DELETE SET NULL,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    category        TEXT NOT NULL CHECK (category IN (
        'cleaning', 'maintenance', 'supplies', 'utilities',
        'insurance', 'tax', 'platform_fee', 'bank_fee',
        'staff', 'marketing', 'other'
    )),
    description     TEXT,
    amount_mad      DECIMAL(10, 2) NOT NULL,
    receipt_url     TEXT,
    expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    is_recurring    BOOLEAN DEFAULT FALSE,
    recurrence      TEXT CHECK (recurrence IN ('monthly', 'quarterly', 'yearly')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE expenses IS 'Dépenses opérationnelles liées aux propriétés';

-- ============================================================
-- 6. DOCUMENTS (Pièces d'identité, certificats, fiches police)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id        UUID REFERENCES guests(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    doc_type        TEXT NOT NULL CHECK (doc_type IN (
        'id_card', 'passport', 'cin', 'marriage_cert',
        'police_form', 'visa', 'other'
    )),
    file_url        TEXT NOT NULL,
    file_name       TEXT,
    file_size_bytes INTEGER,
    status          TEXT CHECK (status IN ('uploaded', 'verified', 'rejected', 'expired')) DEFAULT 'uploaded',
    verified_at     TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    notes           TEXT,
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE documents IS 'Documents de conformité des invités (ID, certificats, fiches police)';

-- ============================================================
-- 7. MESSAGES (Messagerie unifiée)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id        UUID REFERENCES guests(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    channel         TEXT NOT NULL CHECK (channel IN ('whatsapp', 'airbnb', 'booking', 'email', 'sms', 'direct')),
    direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject         TEXT,
    body            TEXT NOT NULL,
    ai_draft        TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    is_archived     BOOLEAN DEFAULT FALSE,
    external_id     TEXT,
    sent_at         TIMESTAMPTZ DEFAULT NOW(),
    read_at         TIMESTAMPTZ
);

COMMENT ON TABLE messages IS 'Messages unifiés multi-canaux (WhatsApp, Airbnb, Email, etc.)';
COMMENT ON COLUMN messages.ai_draft IS 'Brouillon suggéré par l IA';

-- ============================================================
-- 8. EXCHANGE_RATES (Taux de change EUR/MAD)
-- ============================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency   TEXT NOT NULL DEFAULT 'EUR',
    to_currency     TEXT NOT NULL DEFAULT 'MAD',
    rate            DECIMAL(10, 6) NOT NULL,
    inverse_rate    DECIMAL(10, 6),
    source          TEXT CHECK (source IN ('xe.com', 'manual', 'api', 'bank')) DEFAULT 'manual',
    fetched_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE exchange_rates IS 'Historique des taux de change EUR/MAD';

-- ============================================================
-- 9. TASKS (Tâches opérationnelles)
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id      UUID REFERENCES bookings(id) ON DELETE CASCADE,
    property_id     UUID REFERENCES properties(id) ON DELETE SET NULL,
    type            TEXT NOT NULL CHECK (type IN ('cleaning', 'key_handoff', 'key_return', 'inspection', 'maintenance', 'other')),
    status          TEXT CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')) DEFAULT 'todo',
    priority        TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    due_date        DATE,
    due_time        TIME,
    assigned_to     TEXT,
    completed_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tasks IS 'Tâches opérationnelles auto-générées et manuelles';

-- ============================================================
-- 10. INDEXES (Performance)
-- ============================================================

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_platform ON bookings(platform);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_payout_status ON bookings(payout_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- Payouts
CREATE INDEX IF NOT EXISTS idx_payouts_booking ON payouts(booking_id);
CREATE INDEX IF NOT EXISTS idx_payouts_audit_status ON payouts(audit_status);
CREATE INDEX IF NOT EXISTS idx_payouts_date ON payouts(payout_date);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expenses_property ON expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_guest ON documents(guest_id);
CREATE INDEX IF NOT EXISTS idx_documents_booking ON documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_guest ON messages(guest_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_sent ON messages(sent_at DESC);

-- Exchange Rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(fetched_at DESC);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_booking ON tasks(booking_id);
CREATE INDEX IF NOT EXISTS idx_tasks_property ON tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS) — Prepared for Auth
-- ============================================================
-- Note: Enable RLS when Supabase Auth is configured.
-- For now, tables are accessible. Uncomment when ready.

-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. TRIGGERS (updated_at auto-update)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'properties', 'guests', 'bookings', 'payouts',
            'expenses', 'tasks'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            tbl
        );
    END LOOP;
END $$;

-- ============================================================
-- 13. SEED DATA — Default property (optional)
-- ============================================================
-- INSERT INTO properties (name, city, type, bedrooms, max_guests, cleaning_fee_mad, city_tax_per_night_mad)
-- VALUES ('Mon Riad', 'Marrakech', 'riad', 3, 6, 150.00, 25.00);

-- ============================================================
-- DONE ✅
-- Tables created: 9 (properties, guests, bookings, payouts,
--                     expenses, documents, messages, exchange_rates, tasks)
-- Indexes: 22
-- Triggers: 6 (auto updated_at)
-- ============================================================
