-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  role_id integer not null, -- Links to your existing roles table logically, or 0 for all
  uploaded_by uuid, -- For tracking who uploaded
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb -- For any extra info
);

-- Create a table to store the document chunks and their embeddings
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null, -- The text chunk
  embedding vector(768), -- Google Gemini typically outputs 768-dimensional embeddings
  chunk_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index to speed up vector similarity search
-- For cosine similarity, use vector_cosine_ops
create index on document_chunks using hnsw (embedding vector_cosine_ops);

-- Create a function to similarity search document chunks
-- This function will be called via Supabase RPC
create or replace function match_document_chunks (
  query_embedding vector(768),
  match_count int DEFAULT 5,
  filter_role_id int DEFAULT null,
  filter_threshold float DEFAULT 0.5
) returns table (
  id uuid,
  document_id uuid,
  file_name text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    d.file_name,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where 1 - (dc.embedding <=> query_embedding) > filter_threshold
    and (filter_role_id is null or d.role_id = filter_role_id or d.role_id = 0) -- role_id 0 could mean accessible to all
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
