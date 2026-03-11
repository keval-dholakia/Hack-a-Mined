'use server'

import { ragSupabaseAdmin } from '@/lib/ragSupabase'
import { extractTextFromBuffer, chunkText, generateEmbedding } from '@/lib/ragUtils'
import { getSessionUser } from '@/app/actions/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ── Document Upload ───────────────────────────────────────────────────────────

export async function uploadDocument(formData: FormData) {
  const user = await getSessionUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File
  const role_id_str = formData.get('role_id') as string // "0" for all roles, or specific role ID

  if (!file) return { error: 'No file provided' }

  try {
    const roleId = parseInt(role_id_str) || 0;
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 1. Insert Document record
    const { data: docRecord, error: docError } = await ragSupabaseAdmin
      .from('documents')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        role_id: roleId,
        uploaded_by: user.id
      })
      .select('id')
      .single()

    if (docError || !docRecord) {
        throw new Error(`Failed to insert document: ${docError?.message}`)
    }

    // 2. Extract text and Chunk
    const text = await extractTextFromBuffer(buffer, file.type)
    const chunks = chunkText(text)

    // 3. Generate embeddings and insert chunks in parallel batches
    const chunkRecords = []
    
    // Process all chunks in parallel to drastically improve speed
    const embeddingPromises = chunks.map(async (chunkContent, i) => {
        const embedding = await generateEmbedding(chunkContent)
        return {
            document_id: docRecord.id,
            content: chunkContent,
            embedding,
            chunk_index: i
        }
    })
    
    const results = await Promise.all(embeddingPromises)
    chunkRecords.push(...results)
    
    // Batch insert chunks
    if (chunkRecords.length > 0) {
        const { error: chunkError } = await ragSupabaseAdmin
            .from('document_chunks')
            .insert(chunkRecords)
            
        if (chunkError) {
            throw new Error(`Failed to insert chunks: ${chunkError.message}`)
        }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Upload Error:', error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}

// ── Chatbot RAG Retrieval ─────────────────────────────────────────────────────

export async function askChatbot(query: string) {
  const user = await getSessionUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    // 1. Generate embedding for user query
    const queryEmbedding = await generateEmbedding(query)
    
    // 2. Search for similar chunks in the Supabase DB
    // RLS in Supabase might be set up, but we are using Admin client so we manually filter by role_id
    // Remember users can access documents for role_id = 0 OR their own role_id
    // But since `match_document_chunks` takes `filter_role_id`, we pass user.role_id
    // and the function logic handles returning `d.role_id = filter_role_id OR d.role_id = 0`.
    
    const { data: matches, error: matchError } = await ragSupabaseAdmin.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_count: 5,
        filter_role_id: user.role_id,
        filter_threshold: 0.5
    })

    if (matchError) {
        throw new Error(`Vector search failed: ${matchError.message}`)
    }

    // 3. Build context from matches
    let contextText = ''
    if (matches && matches.length > 0) {
        contextText = matches.map((m: any) => `Document: ${m.file_name}\nContent: ${m.content}\n`).join('\n---\n')
    } else {
        contextText = 'No relevant documents found in the database.'
    }

    // 4. Generate response with Gemini
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 500, // Limit response length to speed up generation
        temperature: 0.3,
      }
    });
    
    const prompt = `
You are a concise company assistant. Answer the query based ONLY on the provided context below. Be direct and brief. If the context does not contain the answer, say "I don't know based on the provided documents." Answer in markdown.

== CONTEXT ==
${contextText}

== USER QUERY ==
${query}
    `.trim()

    const result = await model.generateContent(prompt)
    const replyText = result.response.text()

    if (!replyText) throw new Error('Gemini returned an empty response.')

    return { success: true, reply: replyText }
  } catch (error: any) {
    console.error('Chatbot Error:', error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}
