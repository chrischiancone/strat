-- Create table for storing AI analysis results
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.strategic_plans(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('plan_analysis', 'trend_analysis', 'prediction_analysis', 'recommendation_analysis')),
  results JSONB NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_analyses_plan_id ON public.ai_analyses(plan_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON public.ai_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON public.ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON public.ai_analyses(created_at);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_ai_analyses_plan_type_created ON public.ai_analyses(plan_id, analysis_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view ai_analyses for their department" ON public.ai_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND (
        -- Admin can see all
        u.role = 'admin'
        OR
        -- Users can see analyses for their own department or plans they have access to
        (
          user_id = auth.uid()
          OR
          EXISTS (
            SELECT 1 FROM public.strategic_plans p
            JOIN public.users pu ON p.department_id = pu.department_id
            WHERE p.id = plan_id AND pu.id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Users can create ai_analyses" ON public.ai_analyses
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'finance', 'city_manager', 'department_head', 'staff')
    )
  );

CREATE POLICY "Users can update their own ai_analyses" ON public.ai_analyses
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "Admins can delete ai_analyses" ON public.ai_analyses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_analyses_updated_at
  BEFORE UPDATE ON public.ai_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_analyses_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.ai_analyses IS 'Stores AI-generated analysis results for strategic plans';
COMMENT ON COLUMN public.ai_analyses.plan_id IS 'Reference to the plan being analyzed (nullable for general analyses)';
COMMENT ON COLUMN public.ai_analyses.analysis_type IS 'Type of AI analysis performed';
COMMENT ON COLUMN public.ai_analyses.results IS 'JSON storage for analysis results and insights';
COMMENT ON COLUMN public.ai_analyses.user_id IS 'User who requested the analysis';

-- Insert sample data for demonstration (optional)
-- This will be populated when users run their first AI analyses