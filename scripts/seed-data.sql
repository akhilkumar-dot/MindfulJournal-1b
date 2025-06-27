-- Insert sample emotion tags
INSERT INTO emotion_tags (name, color) VALUES
('Grateful', '#10b981'),
('Peaceful', '#3b82f6'),
('Anxious', '#f59e0b'),
('Happy', '#8b5cf6'),
('Stressed', '#ef4444'),
('Excited', '#ec4899'),
('Calm', '#6366f1'),
('Tired', '#6b7280'),
('Hopeful', '#14b8a6'),
('Overwhelmed', '#f97316'),
('Content', '#84cc16'),
('Frustrated', '#dc2626')
ON CONFLICT (name) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, criteria) VALUES
('First Entry', 'Completed your first journal entry', 'BookOpen', '{"type": "entry_count", "value": 1}'),
('Week Warrior', 'Maintained a 7-day journaling streak', 'Flame', '{"type": "streak", "value": 7}'),
('Mood Master', 'Achieved an average mood of 8+ for a week', 'Heart', '{"type": "avg_mood", "value": 8, "period": "week"}'),
('Consistency Champion', 'Journaled for 30 consecutive days', 'Trophy', '{"type": "streak", "value": 30}'),
('Reflection Rookie', 'Wrote 10 journal entries', 'Star', '{"type": "entry_count", "value": 10}'),
('Mindful Milestone', 'Completed 100 journal entries', 'Award', '{"type": "entry_count", "value": 100}'),
('Gratitude Guru', 'Mentioned gratitude in 20 entries', 'Heart', '{"type": "emotion_tag", "tag": "Grateful", "value": 20}'),
('Stress Buster', 'Reduced average stress level by 2 points', 'Shield', '{"type": "stress_reduction", "value": 2}'),
('Monthly Master', 'Completed 25 entries in a single month', 'Calendar', '{"type": "monthly_entries", "value": 25}'),
('Mood Tracker', 'Logged mood for 50 consecutive days', 'TrendingUp', '{"type": "mood_streak", "value": 50}')
ON CONFLICT DO NOTHING;

-- Insert sample prompts
INSERT INTO prompts (content, category, is_ai_generated) VALUES
('What are three things you''re grateful for today, and why do they matter to you?', 'gratitude', false),
('Describe a moment today when you felt truly present. What made it special?', 'mindfulness', false),
('What challenge did you face today, and what did you learn from it?', 'growth', false),
('How did you show kindness to yourself or others today?', 'compassion', false),
('What emotions are you experiencing right now, and what might they be telling you?', 'emotions', false),
('Reflect on a recent conversation that made you feel understood. What qualities would you like to cultivate?', 'relationships', false),
('What small act of self-care brought you peace today?', 'self-care', false),
('Describe a recent accomplishment, no matter how small, and how it made you feel.', 'achievement', false),
('What patterns do you notice in your thoughts or behaviors lately?', 'self-awareness', false),
('How can you be more compassionate with yourself tomorrow?', 'self-compassion', false),
('What aspect of your life feels most balanced right now?', 'balance', false),
('Describe a place where you feel most at peace. What makes it special?', 'peace', false),
('What lesson has this week taught you about yourself?', 'reflection', false),
('How did you handle stress today, and what worked well?', 'stress-management', false),
('What are you looking forward to, and why does it excite you?', 'anticipation', false)
ON CONFLICT DO NOTHING;
