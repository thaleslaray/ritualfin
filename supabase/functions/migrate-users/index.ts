import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrateRequest {
  targetProjectUrl: string;
  serviceRoleKey: string;
}

interface UserToMigrate {
  id: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetProjectUrl, serviceRoleKey }: MigrateRequest = await req.json();

    if (!targetProjectUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'targetProjectUrl and serviceRoleKey are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 Starting user migration...');
    console.log(`Target project: ${targetProjectUrl}`);

    // Connect to current database to fetch users
    const currentSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all users from profiles table (which has user IDs and emails)
    const { data: profiles, error: fetchError } = await currentSupabase
      .from('profiles')
      .select('id, email');

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users from current database', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No users found to migrate' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${profiles.length} users to migrate`);

    // Connect to target Supabase with Admin privileges
    const targetSupabase = createClient(targetProjectUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Create each user in the target project
    for (const profile of profiles) {
      console.log(`👤 Migrating user: ${profile.email} (${profile.id})`);

      try {
        // Create user with the SAME UUID
        const { data: newUser, error: createError } = await targetSupabase.auth.admin.createUser({
          email: profile.email,
          email_confirm: true, // Auto-confirm email
          user_metadata: { migrated_from: 'vhdjckcfchurjidvpqmb' },
          // @ts-ignore - uid is valid but not in types
          uid: profile.id, // CRITICAL: Keep the same UUID!
        });

        if (createError) {
          console.error(`❌ Error creating ${profile.email}:`, createError);
          results.push({ email: profile.email, success: false, error: createError.message });
          continue;
        }

        console.log(`✅ User ${profile.email} created successfully`);

        // Generate password reset link
        const { error: resetError } = await targetSupabase.auth.admin.generateLink({
          type: 'recovery',
          email: profile.email,
        });

        if (resetError) {
          console.warn(`⚠️ Could not generate reset link for ${profile.email}:`, resetError.message);
          results.push({ 
            email: profile.email, 
            success: true, 
            error: `User created but reset email failed: ${resetError.message}` 
          });
        } else {
          console.log(`📧 Password reset link generated for ${profile.email}`);
          results.push({ email: profile.email, success: true });
        }

      } catch (err) {
        console.error(`❌ Exception for ${profile.email}:`, err);
        results.push({ email: profile.email, success: false, error: String(err) });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 Migration complete: ${successful} success, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: 'Migration completed',
        summary: {
          total: profiles.length,
          successful,
          failed
        },
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: 'Migration failed', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
