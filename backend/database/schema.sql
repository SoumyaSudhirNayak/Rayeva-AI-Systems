-- =============================================
-- SustainCommerce SaaS Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Products Table
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    primary_category VARCHAR(255),
    sub_category VARCHAR(255),
    seo_tags JSONB DEFAULT '[]'::jsonb,
    sustainability_filters JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Proposals Table
-- =============================================
CREATE TABLE IF NOT EXISTS proposals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    budget NUMERIC(12, 2) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    product_mix JSONB DEFAULT '[]'::jsonb,
    allocation JSONB DEFAULT '{}'::jsonb,
    cost_breakdown JSONB DEFAULT '{}'::jsonb,
    impact_summary JSONB DEFAULT '""'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. AI Logs Table
-- =============================================
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    raw_response TEXT,
    parsed_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_module_name ON ai_logs(module_name);

-- =============================================
-- Enable Row Level Security (Supabase best practice)
-- Set to permissive for service-role access from backend
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated/service role
CREATE POLICY "Allow all for service role" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON proposals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON ai_logs FOR ALL USING (true) WITH CHECK (true);
