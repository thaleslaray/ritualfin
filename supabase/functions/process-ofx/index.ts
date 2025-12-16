import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OFXTransaction {
  type: string;
  datePosted: string;
  amount: number;
  fitId: string;
  name: string;
  memo?: string;
}

interface ParsedOFX {
  transactions: OFXTransaction[];
  accountId?: string;
  bankId?: string;
}

// Normalize merchant name for fingerprinting
function normalizeMerchant(merchant: string): string {
  return merchant
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize spaces
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

// Generate import hash for idempotency
function generateImportHash(content: string, coupleId: string): string {
  const input = `${coupleId}|${content.length}|${content.substring(0, 500)}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Parse OFX date format (YYYYMMDDHHMMSS or YYYYMMDD)
function parseOFXDate(dateStr: string): string {
  const cleanDate = dateStr.replace(/\[.*\]/, "").trim();
  const year = cleanDate.substring(0, 4);
  const month = cleanDate.substring(4, 6);
  const day = cleanDate.substring(6, 8);
  return `${year}-${month}-${day}`;
}

// Simple OFX parser
function parseOFX(content: string): ParsedOFX {
  const transactions: OFXTransaction[] = [];
  
  // Extract transactions using regex
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  
  while ((match = stmtTrnRegex.exec(content)) !== null) {
    const trnBlock = match[1];
    
    const getTagValue = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, "i");
      const m = trnBlock.match(regex);
      return m ? m[1].trim() : "";
    };
    
    const type = getTagValue("TRNTYPE");
    const datePosted = getTagValue("DTPOSTED");
    const amountStr = getTagValue("TRNAMT");
    const fitId = getTagValue("FITID");
    const name = getTagValue("NAME");
    const memo = getTagValue("MEMO");
    
    if (datePosted && amountStr && (name || memo)) {
      const amount = parseFloat(amountStr.replace(",", "."));
      if (!isNaN(amount)) {
        transactions.push({
          type,
          datePosted: parseOFXDate(datePosted),
          amount,
          fitId,
          name: name || memo || "Unknown",
          memo,
        });
      }
    }
  }
  
  // Extract account info
  const accountIdMatch = content.match(/<ACCTID>([^<\r\n]+)/i);
  const bankIdMatch = content.match(/<BANKID>([^<\r\n]+)/i);
  
  return {
    transactions,
    accountId: accountIdMatch?.[1]?.trim(),
    bankId: bankIdMatch?.[1]?.trim(),
  };
}

// Detect if transaction is likely an internal transfer
function isLikelyInternalTransfer(merchant: string, amount: number): boolean {
  const transferKeywords = [
    "transferencia",
    "transfer",
    "pix enviado",
    "pix recebido",
    "ted",
    "doc",
    "transf",
  ];
  
  const normalizedMerchant = merchant.toLowerCase();
  return transferKeywords.some(kw => normalizedMerchant.includes(kw));
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing OFX for import ${importId}`);

    // Fetch the OFX file from Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from("uploads")
      .download(fileUrl);

    if (fileError) {
      console.error("Error downloading file:", fileError);
      throw new Error(`Failed to download file: ${fileError.message}`);
    }

    const content = await fileData.text();
    console.log("OFX content length:", content.length);

    // Check for duplicate import using file hash
    const importHash = generateImportHash(content, coupleId);
    
    const { data: existingImport } = await supabase
      .from("imports")
      .select("id")
      .eq("file_hash", importHash)
      .eq("couple_id", coupleId)
      .neq("id", importId)
      .single();

    if (existingImport) {
      console.log("Duplicate import detected");
      await supabase
        .from("imports")
        .update({
          status: "failed",
          error_message: "Este arquivo já foi importado anteriormente",
          processed_at: new Date().toISOString(),
        })
        .eq("id", importId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Duplicate import",
          message: "Este arquivo já foi importado anteriormente",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update import with file hash
    await supabase
      .from("imports")
      .update({ file_hash: importHash })
      .eq("id", importId);

    // Parse OFX content
    const parsed = parseOFX(content);
    console.log(`Parsed ${parsed.transactions.length} transactions from OFX`);

    if (parsed.transactions.length === 0) {
      await supabase
        .from("imports")
        .update({
          status: "failed",
          error_message: "Nenhuma transação encontrada no arquivo OFX",
          processed_at: new Date().toISOString(),
        })
        .eq("id", importId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "No transactions found",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate fingerprints for dedup check
    const fingerprints = parsed.transactions.map(t =>
      generateFingerprint(coupleId, t.datePosted, t.amount, t.name)
    );

    const { data: existingTx } = await supabase
      .from("transactions")
      .select("fingerprint")
      .in("fingerprint", fingerprints);

    const existingFingerprints = new Set(existingTx?.map(t => t.fingerprint) || []);

    // Filter and prepare new transactions
    const newTransactions = parsed.transactions
      .filter(t => {
        const fp = generateFingerprint(coupleId, t.datePosted, t.amount, t.name);
        return !existingFingerprints.has(fp);
      })
      .filter(t => t.amount < 0) // Only expenses (negative amounts in OFX)
      .map(t => ({
        month_id: monthId,
        merchant: t.name,
        merchant_normalized: normalizeMerchant(t.name),
        amount: Math.abs(t.amount), // Store as positive
        transaction_date: t.datePosted,
        source: "ofx" as const,
        confidence: "high" as const,
        needs_review: isLikelyInternalTransfer(t.name, t.amount),
        is_internal_transfer: isLikelyInternalTransfer(t.name, t.amount),
        import_id: importId,
        fingerprint: generateFingerprint(coupleId, t.datePosted, t.amount, t.name),
        raw_data: {
          fitId: t.fitId,
          type: t.type,
          memo: t.memo,
          accountId: parsed.accountId,
          bankId: parsed.bankId,
        },
      }));

    console.log(`${newTransactions.length} new transactions after dedup and filtering`);

    // Insert new transactions
    if (newTransactions.length > 0) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(newTransactions);

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
        transactionsFound: parsed.transactions.length,
        transactionsCreated: newTransactions.length,
        duplicatesSkipped: parsed.transactions.length - newTransactions.length,
        accountId: parsed.accountId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing OFX:", error);

    // Try to update import status to error
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
