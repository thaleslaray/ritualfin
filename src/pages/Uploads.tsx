import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { 
  Upload as UploadIcon, 
  FileText, 
  Image, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Inbox
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useImports, useCreateImport, useUploadFile, useUpdateImportStatus } from "@/hooks/useImports";
import { useCurrentMonth } from "@/hooks/useMonths";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const Uploads = () => {
  const [isDraggingPrint, setIsDraggingPrint] = useState(false);
  const [isDraggingOfx, setIsDraggingOfx] = useState(false);
  
  const { user } = useAuth();
  const { data: currentMonth, isLoading: monthLoading } = useCurrentMonth();
  const { data: imports, isLoading: importsLoading } = useImports();
  const createImport = useCreateImport();
  const uploadFile = useUploadFile();
  const updateStatus = useUpdateImportStatus();

  const handleFiles = useCallback(async (files: File[], type: "print" | "ofx") => {
    if (!currentMonth || !user) {
      toast.error("Erro", { description: "Mês atual não encontrado" });
      return;
    }

    // Get couple_id from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", user.id)
      .single();

    if (!profile?.couple_id) {
      toast.error("Erro", { description: "Perfil não encontrado" });
      return;
    }

    for (const file of files) {
      try {
        // Create import record first
        const importRecord = await createImport.mutateAsync({
          type,
          file_name: file.name,
          status: "processing",
        });

        toast.success(`Enviando ${file.name}`, { description: "Processando..." });

        // Upload file to storage
        const uploadResult = await uploadFile.mutateAsync({
          file,
          coupleId: profile.couple_id,
          type,
        });

        // Update import with file URL
        await supabase
          .from("imports")
          .update({ file_url: uploadResult.path })
          .eq("id", importRecord.id);

        // Call processing edge function
        const functionName = type === "print" ? "process-print" : "process-ofx";
        
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: {
            importId: importRecord.id,
            fileUrl: uploadResult.path,
            monthId: currentMonth.id,
            coupleId: profile.couple_id,
          },
        });

        if (error) {
          console.error("Processing error:", error);
          await updateStatus.mutateAsync({
            id: importRecord.id,
            status: "failed",
            error_message: error.message,
          });
          toast.error(`Erro ao processar ${file.name}`, { description: error.message });
        } else if (data?.success) {
          toast.success(`${file.name} processado!`, {
            description: `${data.transactionsCreated} novas transações encontradas`,
          });
        } else if (data?.error) {
          toast.error(`Erro: ${data.message || data.error}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Erro ao enviar ${file.name}`, {
          description: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }
  }, [currentMonth, user, createImport, uploadFile, updateStatus]);

  const handleDropPrint = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPrint(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) handleFiles(files, "print");
  }, [handleFiles]);

  const handleDropOfx = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOfx(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith(".ofx"));
    if (files.length > 0) handleFiles(files, "ofx");
  }, [handleFiles]);

  const handleFileInputPrint = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files), "print");
    }
  };

  const handleFileInputOfx = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files), "ofx");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "processing":
      case "pending":
        return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const isLoading = monthLoading || importsLoading;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Upload Semanal
          </h1>
          <p className="text-muted-foreground">
            Envie prints de cartão e arquivos OFX para importar transações
          </p>
        </motion.div>

        {/* Upload Areas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Prints Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Prints de Cartão
                </CardTitle>
                <CardDescription>
                  Fotos ou screenshots da lista de transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label
                  className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isDraggingPrint
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingPrint(true); }}
                  onDragLeave={() => setIsDraggingPrint(false)}
                  onDrop={handleDropPrint}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInputPrint}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <UploadIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Arraste imagens aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ou clique para selecionar
                  </p>
                </label>
              </CardContent>
            </Card>
          </motion.div>

          {/* OFX Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Arquivos OFX
                </CardTitle>
                <CardDescription>
                  Extrato bancário em formato OFX (até 2 contas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label
                  className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isDraggingOfx
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary/50 hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOfx(true); }}
                  onDragLeave={() => setIsDraggingOfx(false)}
                  onDrop={handleDropOfx}
                >
                  <input
                    type="file"
                    accept=".ofx"
                    multiple
                    className="hidden"
                    onChange={handleFileInputOfx}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Arraste arquivos OFX
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ou clique para selecionar
                  </p>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upload History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Histórico de Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !imports || imports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">Nenhum upload ainda</p>
                  <p className="text-sm text-muted-foreground/70">
                    Envie prints ou arquivos OFX para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {imports.map((upload, index) => (
                    <motion.div
                      key={upload.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        upload.type === "print" ? "bg-primary/10" : "bg-secondary/10"
                      }`}>
                        {upload.type === "print" ? (
                          <Image className="w-5 h-5 text-primary" />
                        ) : (
                          <FileText className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {upload.file_name || `${upload.type} upload`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {upload.status === "completed" && upload.transactions_count !== null && (
                            <span className="text-success">{upload.transactions_count} transações encontradas</span>
                          )}
                          {(upload.status === "processing" || upload.status === "pending") && (
                            <span className="text-primary">Processando...</span>
                          )}
                          {upload.status === "failed" && (
                            <span className="text-destructive">{upload.error_message || "Erro no processamento"}</span>
                          )}
                          <span className="mx-2">•</span>
                          {formatDistanceToNow(new Date(upload.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      {getStatusIcon(upload.status)}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Uploads;
