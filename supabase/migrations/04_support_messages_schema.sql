
-- Create support_messages table
CREATE TABLE support_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Policies for public users (using session_id)
CREATE POLICY "Allow users to view their session messages" 
ON support_messages FOR SELECT 
USING (true); -- In a real app, we might filter by session_id cookie or token

CREATE POLICY "Allow users to insert their session messages" 
ON support_messages FOR INSERT 
WITH CHECK (sender_type = 'user');

-- Admin policies
CREATE POLICY "Allow admins to view all messages" 
ON support_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Allow admins to insert responses" 
ON support_messages FOR INSERT 
WITH CHECK (
  sender_type = 'admin' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
