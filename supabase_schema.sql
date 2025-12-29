-- TechNexus AI Quiz Platform: Supabase Schema
-- This script sets up the necessary tables and security policies for the platform.

-- 1. Create Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    questions JSONB NOT NULL, -- Stores array of {q, options, correct}
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id TEXT, -- The numeric code used for joining (e.g., 123456)
    timer INTEGER DEFAULT 30 -- Question duration in seconds
);


-- 2. Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow admins to insert their own quizzes
CREATE POLICY "Admins can create quizzes" 
ON public.quizzes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = creator_id);

-- Allow admins to view their own quizzes
CREATE POLICY "Admins can view their own quizzes" 
ON public.quizzes FOR SELECT 
TO authenticated 
USING (auth.uid() = creator_id);

-- Allow anyone to view a quiz by room_id (for the Join flow, though usually handled via socket)
-- In this architecture, the socket server holds the quiz in memory, 
-- but we allow public read of basic quiz info if needed.
CREATE POLICY "Public can view quiz info by room_id" 
ON public.quizzes FOR SELECT 
TO public 
USING (true);

-- Allow admins to delete their own quizzes
CREATE POLICY "Admins can delete their own quizzes" 
ON public.quizzes FOR DELETE 
TO authenticated 
USING (auth.uid() = creator_id);

-- Allow admins to update their own quizzes
CREATE POLICY "Admins can update their own quizzes" 
ON public.quizzes FOR UPDATE 
TO authenticated 
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- 4. Indices for performance
CREATE INDEX IF NOT EXISTS quizzes_creator_id_idx ON public.quizzes(creator_id);
CREATE INDEX IF NOT EXISTS quizzes_room_id_idx ON public.quizzes(room_id);
