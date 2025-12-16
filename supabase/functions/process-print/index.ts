import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisionResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{ x: number; y: number }>;
      };
    }>;
    error?: { message: string };
  }>;
}

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
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize spaces
    .trim()
    .substring(0, 50); // Limit length
}

// Generate fingerprint for deduplication
function generateFingerprint(coupleId: string, date: string, amount: number, merchant: string): string {
  const normalizedMerchant = normalizeMerchant(merchant);
  const normalizedAmount = Math.abs(amount).toFixed(2);
  const input = `${coupleId}|${date}|${normalizedAmount}|${normalizedMerchant}`;
  
  // Simple hash for fingerprint
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Parse Brazilian currency format
function parseAmount(amountStr: string): number | null {
  // Handle formats like "1.234,56" or "1234,56" or "R$ 1.234,56"
  const cleaned = amountStr
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
}

// Parse date from various formats
function parseDate(dateStr: string): string | null {
  // Try DD/MM/YYYY or DD/MM
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3] ? (match[3].length === 2 ? `20${match[3]}` : match[3]) : new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }
  return null;
}

// Extract transactions from OCR text
function extractTransactions(text: string, coupleId: string): ExtractedTransaction[] {
  const lines = text.split("\n");
  const transactions: ExtractedTransaction[] = [];
  
  // Pattern: date, merchant, amount (Brazilian format)
  const transactionPattern = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(.+?)\s+([-]?\d{1,3}(?:\.\d{3})*,\d{2})/g;
  
  for (const line of lines) {
    let match;
    while ((match = transactionPattern.exec(line)) !== null) {
      const dateStr = match[1];
      const merchant = match[2].trim();
      const amountStr = match[3];
      
      const date = parseDate(dateStr);
      const amount = parseAmount(amountStr);
      
      if (date && amount !== null && merchant.length > 2) {
        transactions.push({
          date,
          merchant,
          merchantNormalized: normalizeMerchant(merchant),
          amount: Math.abs(amount), // Store as positive, expenses are always positive in this context
        });
      }
    }
  }
  
  // Fallback: try line-by-line parsing
  if (transactions.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for amount pattern
      const amountMatch = line.match(/([-]?\d{1,3}(?:\.\d{3})*,\d{2})/);
      if (amountMatch) {
        const amount = parseAmount(amountMatch[1]);
        if (amount !== null && amount > 0) {
          // Look for date in same or previous line
          const dateMatch = line.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
          const date = dateMatch ? parseDate(dateMatch[1]) : null;
          
          // Extract merchant (text before amount)
          const merchantMatch = line.replace(amountMatch[0], "").replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/, "").trim();
          
          if (date && merchantMatch.length > 2) {
            transactions.push({
              date,
              merchant: merchantMatch,
              merchantNormalized: normalizeMerchant(merchantMatch),
              amount: Math.abs(amount),
            });
          }
        }
      }
    }
  }
  
  return transactions;
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

    const GOOGLE_VISION_API_KEY = Deno.env.get("GOOGLE_VISION_API_KEY");
    if (!GOOGLE_VISION_API_KEY) {
      console.error("GOOGLE_VISION_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "OCR service not configured" }),
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

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: "TEXT_DETECTION" }],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("Vision API error:", errorText);
      throw new Error(`Vision API error: ${visionResponse.status}`);
    }

    const visionData: VisionResponse = await visionResponse.json();
    
    if (visionData.responses[0]?.error) {
      throw new Error(visionData.responses[0].error.message);
    }

    const fullText = visionData.responses[0]?.textAnnotations?.[0]?.description || "";
    console.log("Extracted text length:", fullText.length);

    // Extract transactions from OCR text
    const extractedTransactions = extractTransactions(fullText, coupleId);
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
        raw_data: { ocr_text: fullText.substring(0, 1000) },
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
