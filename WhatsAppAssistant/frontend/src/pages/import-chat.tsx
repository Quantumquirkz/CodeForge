import { useState, useRef } from "react";
import { useImports, useUploadImport } from "@/hooks/use-imports";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Loader2, Calendar } from "lucide-react";

export default function ImportChat() {
  const { data: imports, isLoading } = useImports();
  const uploadImport = useUploadImport();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({ title: "Falta archivo", description: "Selecciona un archivo .txt exportado de WhatsApp", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Falta nombre", description: "Ponle un nombre a esta importación para identificarla", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    uploadImport.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Importación exitosa", description: "El chat ha sido procesado y guardado." });
        setFile(null);
        setName("");
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: (err) => {
        toast({ title: "Error de importación", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      <PageHeader 
        title="Importar Historial" 
        description="Sube historiales exportados de WhatsApp (.txt) para analizar contexto."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <Card className="glass-panel col-span-1 border-primary/20">
          <CardHeader>
            <CardTitle className="font-display">Nuevo Archivo</CardTitle>
            <CardDescription>Exporta un chat de WhatsApp "Sin archivos multimedia" y súbelo aquí.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="import-name">Nombre descriptivo</Label>
              <Input 
                id="import-name"
                placeholder="Ej: Chat con Cliente X"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/20 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Archivo TXT</Label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                  ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/30 bg-black/10'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".txt" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-primary mb-3" />
                    <span className="font-medium text-sm text-primary">{file.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
                    <span className="font-medium text-sm text-slate-300">Click para seleccionar</span>
                    <span className="text-xs text-muted-foreground mt-1">Solo formato .txt</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleUpload}
              disabled={!file || !name || uploadImport.isPending}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
            >
              {uploadImport.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              Procesar y Guardar
            </Button>
          </CardContent>
        </Card>

        {/* Previous Imports */}
        <Card className="glass-panel col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Archivos Importados</CardTitle>
            <CardDescription>Archivos disponibles para ser usados en análisis de contexto.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : !imports || imports.length === 0 ? (
              <div className="text-center py-12 border border-white/5 rounded-xl bg-black/10">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No hay archivos importados aún.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {imports.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="font-mono">{item.source_file}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(item.imported_at), "dd MMM yyyy, HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
