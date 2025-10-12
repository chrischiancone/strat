-- =====================================================
-- DASHBOARD MESSAGES 
-- =====================================================
CREATE TABLE dashboard_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  heading TEXT NOT NULL,
  message TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT dashboard_messages_bg_color_check CHECK (bg_color IN ('green', 'yellow', 'blue'))
);

CREATE INDEX dashboard_messages_location_idx ON dashboard_messages(location);

-- Add audit trigger
CREATE TRIGGER dashboard_messages_audit AFTER INSERT OR UPDATE OR DELETE ON dashboard_messages
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Update timestamp trigger  
CREATE TRIGGER dashboard_messages_updated_at BEFORE UPDATE ON dashboard_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some default messages
INSERT INTO dashboard_messages (location, heading, message, bg_color) VALUES
('initiatives_footer', 
 'Getting Started with Initiatives', 
 'Each initiative should have clear expected outcomes, resource requirements, and success metrics.',
 'blue');