import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { 
  Upload as UploadIcon, 
  FileText, 
  Image, 
  CheckCircle2, 
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
import { useQueryClient } from "@tanstack/react-query";

const Uploads = () => {
  const [isDraggingPrint, setIsDraggingPrint] = useState(false);
  const [isDraggingOfx, setIsDraggingOfx] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
      let importRecord: { id: string } | null = null;
      
      try {
        importRecord = await createImport.mutateAsync({
          type,
          file_name: file.name,
          status: "processing",
        });

        toast.success(`Enviando ${file.name}`, { description: "Processando..." });

        const uploadResult = await uploadFile.mutateAsync({
          file,
          coupleId: profile.couple_id,
          type,
        });

        await supabase
          .from("imports")
          .update({ file_url: uploadResult.path })
          .eq("id", importRecord.id);

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
          queryClient.invalidateQueries({ queryKey: ["imports"] });
          toast.success(`${file.name} processado!`, {
            description: `${data.transactionsCreated} novas transações`,
          });
        } else if (data?.error) {
          toast.error(`Erro: ${data.message || data.error}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        if (importRecord?.id) {
          await updateStatus.mutateAsync({
            id: importRecord.id,
            status: "failed",
            error_message: error instanceof Error ? error.message : "Erro no upload",
          });
        }
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
  }, [currentMonth, user, createImport, uploadFile, updateStatus, queryClient]);

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
        return null;
    }
  };

  const isLoading = monthLoading || importsLoading;

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-display text-foreground mb-2">
            Uploads
          </h1>
          <p className="text-body text-muted-foreground">
            Envie prints e arquivos OFX
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Image className="w-5 h-5 text-primary" />
                  </div>
                  Prints
                </CardTitle>
                <CardDescription>
                  Screenshots da lista de transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label
                  className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    isDraggingPrint
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
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
                  <UploadIcon className="w-10 h-10 text-muted-foreground mb-4" strokeWidth={1.5} />
                  <p className="text-body text-foreground font-medium mb-1">
                    Arraste imagens
                  </p>
                  <p className="text-caption text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-success" />
                  </div>
                  Arquivos OFX
                </CardTitle>
                <CardDescription>
                  Extrato bancário em formato OFX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label
                  className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    isDraggingOfx
                      ? "border-success bg-success/5"
                      : "border-border hover:border-success/50 hover:bg-muted/30"
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
                  <UploadIcon className="w-10 h-10 text-muted-foreground mb-4" strokeWidth={1.5} />
                  <p className="text-body text-foreground font-medium mb-1">
                    Arraste arquivos OFX
                  </p>
                  <p className="text-caption text-muted-foreground">
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
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))}
                </div>
              ) : !imports || imports.length === 0 ? (
                <div className="text-center py-16">
                  <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-body text-muted-foreground">Nenhum upload ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {imports.map((upload, index) => (
                    <motion.div
                      key={upload.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        upload.type === "print" ? "bg-primary/10" : "bg-success/10"
                      }`}>
                        {upload.type === "print" ? (
                          <Image className="w-5 h-5 text-primary" />
                        ) : (
                          <FileText className="w-5 h-5 text-success" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-foreground font-medium truncate">
                          {upload.file_name || `${upload.type} upload`}
                        </p>
                        <p className="text-caption text-muted-foreground">
                          {upload.status === "completed" && upload.transactions_count !== null && (
                            <span className="text-success">{upload.transactions_count} transações</span>
                          )}
                          {(upload.status === "processing" || upload.status === "pending") && (
                            <span className="text-primary">Processando...</span>
                          )}
                          {upload.status === "failed" && (
                            <span className="text-destructive">Erro</span>
                          )}
                          <span className="mx-2">·</span>
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
