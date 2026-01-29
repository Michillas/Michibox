-- ================================================
-- Neon Database Schema Export
-- Generated: ${new Date().toISOString()}
-- Database: neondb
-- ================================================

-- This script contains the complete database schema
-- Run this script to recreate the database structure

-- Note: Run each section in order

-- ================================================
-- EXTENSIONS
-- ================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Users table (managed by Neon Auth in neon_auth schema)
-- The neon_auth.user table is automatically managed by Neon Auth
-- You don't need to create it manually

-- User Profiles table - public profile information with slugs
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    imdb_id VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    type VARCHAR(50) NOT NULL,
    poster_url TEXT,
    start_year INTEGER,
    end_year INTEGER,
    runtime_seconds INTEGER,
    genres TEXT[],
    rating DECIMAL(3,1),
    vote_count INTEGER,
    plot TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, imdb_id)
);

-- Watched table
CREATE TABLE IF NOT EXISTS public.watched (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    imdb_id VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    type VARCHAR(50) NOT NULL,
    poster_url TEXT,
    start_year INTEGER,
    end_year INTEGER,
    runtime_seconds INTEGER,
    genres TEXT[],
    rating DECIMAL(3,1),
    vote_count INTEGER,
    plot TEXT,
    user_rating INTEGER,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, imdb_id)
);

-- Top Series table
CREATE TABLE IF NOT EXISTS public.top_series (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    imdb_id VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    poster_url TEXT,
    start_year INTEGER,
    end_year INTEGER,
    genres TEXT[],
    rating DECIMAL(3,1),
    vote_count INTEGER,
    plot TEXT,
    rank INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, imdb_id)
);

-- ================================================
-- INDEXES
-- ================================================

-- User Profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_slug ON public.user_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Watchlist indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_imdb_id ON public.watchlist(imdb_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_added_at ON public.watchlist(added_at DESC);

-- Watched indexes
CREATE INDEX IF NOT EXISTS idx_watched_user_id ON public.watched(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_imdb_id ON public.watched(imdb_id);
CREATE INDEX IF NOT EXISTS idx_watched_watched_at ON public.watched(watched_at DESC);

-- Top Series indexes
CREATE INDEX IF NOT EXISTS idx_top_series_user_id ON public.top_series(user_id);
CREATE INDEX IF NOT EXISTS idx_top_series_rank ON public.top_series(user_id, rank);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watched ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_series ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone"
    ON public.user_profiles FOR SELECT
    USING (is_public = true);

CREATE POLICY IF NOT EXISTS "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (user_id = auth.user_id());

-- Watchlist policies
CREATE POLICY IF NOT EXISTS "Users can view their own watchlist"
    ON public.watchlist FOR SELECT
    USING (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can insert their own watchlist"
    ON public.watchlist FOR INSERT
    WITH CHECK (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can update their own watchlist"
    ON public.watchlist FOR UPDATE
    USING (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can delete their own watchlist"
    ON public.watchlist FOR DELETE
    USING (user_id = auth.user_id());

-- Watched policies
CREATE POLICY IF NOT EXISTS "Users can view their own watched"
    ON public.watched FOR SELECT
    USING (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Public profiles watched content is viewable"
    ON public.watched FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = watched.user_id 
            AND user_profiles.is_public = true
        )
    );

CREATE POLICY IF NOT EXISTS "Users can insert their own watched"
    ON public.watched FOR INSERT
    WITH CHECK (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can update their own watched"
    ON public.watched FOR UPDATE
    USING (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can delete their own watched"
    ON public.watched FOR DELETE
    USING (user_id = auth.user_id());

-- Top Series policies
CREATE POLICY IF NOT EXISTS "Users can view their own top series"
    ON public.top_series FOR SELECT
    USING (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Public profiles top series is viewable"
    ON public.top_series FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = top_series.user_id 
            AND user_profiles.is_public = true
        )
    );

CREATE POLICY IF NOT EXISTS "Users can insert their own top series"
    ON public.top_series FOR INSERT
    WITH CHECK (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can update their own top series"
    ON public.top_series FOR UPDATE
    USING (user_id = auth.user_id());

CREATE POLICY IF NOT EXISTS "Users can delete their own top series"
    ON public.top_series FOR DELETE
    USING (user_id = auth.user_id());

-- ================================================
-- GRANTS
-- ================================================

-- Grant permissions to the database owner
GRANT ALL ON public.user_profiles TO neondb_owner;
GRANT ALL ON public.watchlist TO neondb_owner;
GRANT ALL ON public.watched TO neondb_owner;
GRANT ALL ON public.top_series TO neondb_owner;

GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO neondb_owner;
GRANT USAGE, SELECT ON SEQUENCE watchlist_id_seq TO neondb_owner;
GRANT USAGE, SELECT ON SEQUENCE watched_id_seq TO neondb_owner;
GRANT USAGE, SELECT ON SEQUENCE top_series_id_seq TO neondb_owner;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE public.user_profiles IS 'User public profiles with slugs for sharing';
COMMENT ON TABLE public.watchlist IS 'Movies and series users want to watch';
COMMENT ON TABLE public.watched IS 'Movies and series users have watched with their ratings';
COMMENT ON TABLE public.top_series IS 'Users personal top series ranked list';

COMMENT ON COLUMN public.user_profiles.user_id IS 'Reference to neon_auth.user.id';
COMMENT ON COLUMN public.user_profiles.slug IS 'URL-friendly unique identifier for public profiles';
COMMENT ON COLUMN public.watchlist.user_id IS 'Reference to neon_auth.user.id';
COMMENT ON COLUMN public.watched.user_id IS 'Reference to neon_auth.user.id';
COMMENT ON COLUMN public.top_series.user_id IS 'Reference to neon_auth.user.id';

-- ================================================
-- END OF SCHEMA
-- ================================================
