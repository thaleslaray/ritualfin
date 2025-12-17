import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedTransaction {
  date: string;
  merchant: string;
  merchantNormalized: string;
  amount: number;
}

// Normalize merchant name for fingerprinting
function normalizeMerchant(merchant: string): string {
  return merchant
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 50);
}

// Generate fingerprint for deduplication
function generateFingerprint(coupleId: string, date: string, amount: number, merchant: string): string {
  const normalizedMerchant = normalizeMerchant(merchant);
  const normalizedAmount = Math.abs(amount).toFixed(2);
  const input = `${coupleId}|${date}|${normalizedAmount}|${normalizedMerchant}`;
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Get MIME type from file extension
function getMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  return mimeTypes[ext || ''] || 'image/jpeg';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { importId, fileUrl, monthId, coupleId } = await req.json();

    if (!importId || !fileUrl || !monthId || !coupleId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: importId, fileUrl, monthId, coupleId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing print for import ${importId}`);

    // Fetch the image from Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("uploads")
      .download(fileUrl);

    if (fileError) {
      console.error("Error downloading file:", fileError);
      throw new Error(`Failed to download file: ${fileError.message}`);
    }

    // Convert to base64 (using Deno std to handle large files without stack overflow)
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Image = base64Encode(arrayBuffer);
    const mimeType = getMimeType(fileUrl);

    console.log("Calling Gemini for OCR extraction...");

    // Call Gemini via Lovable AI Gateway
    const geminiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um extrator de transações financeiras de prints de faturas de cartão de crédito brasileiro.
Analise a imagem e extraia TODAS as transações visíveis.

Para cada transação, retorne no formato JSON:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "merchant": "Nome do Estabelecimento",
      "amount": 123.45
    }
  ]
}

Regras:
- Datas devem estar em formato YYYY-MM-DD
- Se a data não tiver ano, assuma ${new Date().getFullYear()}
- Valores devem ser números positivos (sem R$, sem vírgulas decimais)
- Converta "1.234,56" para 1234.56
- Ignore linhas que não são transações (totais, saldos, taxas)
- Se não encontrar transações, retorne {"transactions": []}
- Retorne APENAS o JSON, sem explicações`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extraia todas as transações desta fatura de cartão de crédito:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      
      if (geminiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (geminiResponse.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      throw new Error(`AI API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseContent = geminiData.choices?.[0]?.message?.content || "";
    
    console.log("Gemini response received, parsing...");

    // Parse the JSON response from Gemini
    let extractedTransactions: ExtractedTransaction[] = [];
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                        responseContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseContent;
      const parsed = JSON.parse(jsonStr.trim());
      
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        extractedTransactions = parsed.transactions
          .filter((t: any) => t.date && t.merchant && t.amount)
          .map((t: any) => ({
            date: t.date,
            merchant: t.merchant,
            merchantNormalized: normalizeMerchant(t.merchant),
            amount: Math.abs(parseFloat(t.amount)),
          }));
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.log("Raw response:", responseContent);
    }

    console.log(`Extracted ${extractedTransactions.length} transactions`);

    // Check for existing fingerprints to avoid duplicates
    const fingerprints = extractedTransactions.map(t => 
      generateFingerprint(coupleId, t.date, t.amount, t.merchant)
    );

    const { data: existingTx } = await supabase
      .from("transactions")
      .select("fingerprint")
      .in("fingerprint", fingerprints);

    const existingFingerprints = new Set(existingTx?.map(t => t.fingerprint) || []);

    // Filter out duplicates
    const newTransactions = extractedTransactions.filter(t => {
      const fp = generateFingerprint(coupleId, t.date, t.amount, t.merchant);
      return !existingFingerprints.has(fp);
    });

    console.log(`${newTransactions.length} new transactions after dedup`);

    // Insert new transactions
    if (newTransactions.length > 0) {
      const transactionsToInsert = newTransactions.map(t => ({
        month_id: monthId,
        merchant: t.merchant,
        merchant_normalized: t.merchantNormalized,
        amount: t.amount,
        transaction_date: t.date,
        source: "print" as const,
        confidence: "low" as const,
        needs_review: true,
        import_id: importId,
        fingerprint: generateFingerprint(coupleId, t.date, t.amount, t.merchant),
        raw_data: { extracted_by: "gemini-2.5-flash" },
      }));

      const { error: insertError } = await supabase
        .from("transactions")
        .insert(transactionsToInsert);

      if (insertError) {
        console.error("Error inserting transactions:", insertError);
        throw new Error(`Failed to insert transactions: ${insertError.message}`);
      }
    }

    // Update import status
    await supabase
      .from("imports")
      .update({
        status: "completed",
        transactions_count: newTransactions.length,
        processed_at: new Date().toISOString(),
      })
      .eq("id", importId);

    return new Response(
      JSON.stringify({
        success: true,
        transactionsFound: extractedTransactions.length,
        transactionsCreated: newTransactions.length,
        duplicatesSkipped: extractedTransactions.length - newTransactions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing print:", error);
    
    // Try to update import status to failed
    try {
      const { importId } = await req.json().catch(() => ({}));
      if (importId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from("imports")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
            processed_at: new Date().toISOString(),
          })
          .eq("id", importId);
      }
    } catch (e) {
      console.error("Failed to update import status:", e);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
