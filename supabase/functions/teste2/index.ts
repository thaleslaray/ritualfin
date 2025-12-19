import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Acessando os secrets do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseDbUrl = Deno.env.get('SUPABASE_DB_URL')
    
    console.log('SUPABASE_URL:', supabaseUrl)
    console.log('DB URL disponível:', !!supabaseDbUrl)

    // Criando cliente admin (bypassa RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Exemplo: buscar dados de uma tabela (usando service role)
    const { data: couples, error: couplesError } = await supabaseAdmin
      .from('couples')
      .select('id, name, created_at')
      .limit(5)

    if (couplesError) {
      console.error('Erro ao buscar couples:', couplesError)
    }

    // Exemplo: contar registros
    const { count: transactionCount } = await supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Edge function executada com sucesso!',
        secrets_debug: {
          supabase_url: supabaseUrl,
          service_role_key: supabaseServiceKey,
          db_url: supabaseDbUrl,
        },
        sample_data: {
          couples: couples || [],
          total_transactions: transactionCount || 0,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    console.error('Erro na edge function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
