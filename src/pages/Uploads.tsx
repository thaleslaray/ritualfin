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
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useImports, useCreateImport, useUpdateImport } from "@/hooks/useImports";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Uploads = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { data: imports, isLoading } = useImports();
  const createImport = useCreateImport();
  const updateImport = useUpdateImport();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      const type = file.name.endsWith(".ofx") ? "ofx" : "print";
      
      try {
        const newImport = await createImport.mutateAsync({
          type: type as 'print' | 'ofx',
          file_name: file.name,
        });

        toast.success(`${file.name} enviado`, {
          description: "Processando transações...",
        });

        // Simulate processing (in real app, this would be done by an edge function)
        setTimeout(async () => {
          await updateImport.mutateAsync({
            id: newImport.id,
            status: 'completed',
            transactions_count: Math.floor(Math.random() * 15) + 3,
            processed_at: new Date().toISOString(),
          });
          toast.success("Processamento concluído!", {
            description: "Novas transações aguardam categorização.",
          });
        }, 3000);
      } catch (error) {
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

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
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
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
                    isDragging
                      ? "border-secondary bg-secondary/5"
                      : "border-border hover:border-secondary/50 hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".ofx"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
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
              {!imports || imports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum upload ainda</p>
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
                        <p className="font-medium text-foreground truncate">{upload.file_name || "Arquivo"}</p>
                        <p className="text-sm text-muted-foreground">
                          {upload.status === "completed" && upload.transactions_count && (
                            <span className="text-success">{upload.transactions_count} transações encontradas</span>
                          )}
                          {(upload.status === "processing" || upload.status === "pending") && (
                            <span className="text-primary">Processando...</span>
                          )}
                          {upload.status === "failed" && (
                            <span className="text-destructive">Erro: {upload.error_message || "Falha no processamento"}</span>
                          )}
                          <span className="mx-2">•</span>
                          {formatDistanceToNow(new Date(upload.created_at), { addSuffix: true, locale: ptBR })}
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
