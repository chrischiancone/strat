-- Enable GraphQL extension
CREATE EXTENSION IF NOT EXISTS pg_graphql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA graphql TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA graphql TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA graphql TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA graphql TO postgres, anon, authenticated, service_role;

-- Add graphql_public schema to search_path
ALTER DATABASE postgres SET search_path TO public, graphql_public, extensions;
