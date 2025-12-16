import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { 
  Upload as UploadIcon, 
  FileText, 
  Image, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  RefreshCw
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  type: "print" | "ofx";
  status: "processing" | "completed" | "error";
  transactionsFound?: number;
  uploadedAt: string;
}

const mockUploads: UploadedFile[] = [
  { id: "1", name: "nubank_dezembro.png", type: "print", status: "completed", transactionsFound: 12, uploadedAt: "há 2 dias" },
  { id: "2", name: "inter_dezembro.ofx", type: "ofx", status: "completed", transactionsFound: 8, uploadedAt: "há 2 dias" },
];

const Uploads = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>(mockUploads);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const newUploads: UploadedFile[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: file.name.endsWith(".ofx") ? "ofx" : "print",
      status: "processing",
      uploadedAt: "agora",
    }));

    setUploads(prev => [...newUploads, ...prev]);
    
    toast.success(`${files.length} arquivo(s) enviado(s)`, {
      description: "Processando transações...",
    });

    // Simulate processing
    setTimeout(() => {
      setUploads(prev => prev.map(u => 
        newUploads.find(n => n.id === u.id)
          ? { ...u, status: "completed", transactionsFound: Math.floor(Math.random() * 15) + 3 }
          : u
      ));
      toast.success("Processamento concluído!", {
        description: "Novas transações aguardam categorização.",
      });
    }, 3000);
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
        return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
  };

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
              {uploads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum upload ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploads.map((upload, index) => (
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
                          <Image className={`w-5 h-5 ${upload.type === "print" ? "text-primary" : "text-secondary"}`} />
                        ) : (
                          <FileText className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{upload.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {upload.status === "completed" && upload.transactionsFound && (
                            <span className="text-success">{upload.transactionsFound} transações encontradas</span>
                          )}
                          {upload.status === "processing" && (
                            <span className="text-primary">Processando...</span>
                          )}
                          {upload.status === "error" && (
                            <span className="text-destructive">Erro no processamento</span>
                          )}
                          <span className="mx-2">•</span>
                          {upload.uploadedAt}
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
