-- Add draft support to journal entries
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

-- Add prompt tracking
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS prompt_used TEXT;

-- Update existing entries to not be drafts
UPDATE journal_entries 
SET is_draft = FALSE 
WHERE is_draft IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_draft ON journal_entries(user_id, is_draft);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);

-- Ensure we have emotion tags table
CREATE TABLE IF NOT EXISTS emotion_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#6b7280',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default emotion tags if they don't exist
INSERT INTO emotion_tags (name, color) VALUES
    ('Happy', '#10b981'),
    ('Sad', '#3b82f6'),
    ('Anxious', '#f59e0b'),
    ('Grateful', '#8b5cf6'),
    ('Excited', '#ef4444'),
    ('Peaceful', '#06b6d4'),
    ('Frustrated', '#f97316'),
    ('Hopeful', '#84cc16'),
    ('Lonely', '#6b7280'),
    ('Confident', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Create junction table for entry emotions
CREATE TABLE IF NOT EXISTS entry_emotion_tags (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
    emotion_tag_id INTEGER REFERENCES emotion_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entry_id, emotion_tag_id)
);
