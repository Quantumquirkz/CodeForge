import { useState } from "react";
import { useImports } from "@/hooks/use-imports";
import { useAnalyze } from "@/hooks/use-analysis";
import ReactMarkdown from "react-markdown";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";

export default function Analyze() {
  const { data: imports } = useImports();
  const analyze = useAnalyze();
  const { toast } = useToast();

  const [importId, setImportId] = useState<string>("");
  const [senderLabel, setSenderLabel] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!importId) {
      toast({ title: "Falta selección", description: "Elige un archivo importado", variant: "destructive" });
      return;
    }
    if (!query.trim()) {
      toast({ title: "Consulta vacía", description: "Escribe qué quieres analizar del chat", variant: "destructive" });
      return;
    }

    analyze.mutate({
      importedChatId: parseInt(importId),
      senderLabel: senderLabel || undefined,
      query
    }, {
      onSuccess: (data) => {
        setResult(data.analysis);
      },
      onError: (err) => {
        toast({ title: "Error en el análisis", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <PageHeader 
        title="Analizar Contexto" 
        description="Pregúntale a la IA sobre el contenido de los chats importados."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls */}
        <Card className="glass-panel col-span-1 lg:col-span-4 h-fit">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              Parámetros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Archivo a analizar</Label>
              <Select value={importId} onValueChange={setImportId}>
                <SelectTrigger className="bg-black/20 border-white/10">
                  <SelectValue placeholder="Selecciona un chat..." />
                </SelectTrigger>
                <SelectContent>
                  {imports?.map((imp) => (
                    <SelectItem key={imp.id} value={imp.id.toString()}>
                      {imp.name}
                    </SelectItem>
                  ))}
                  {(!imports || imports.length === 0) && (
                    <SelectItem value="none" disabled>No hay archivos</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filtrar por participante (Opcional)</Label>
              <Input 
                placeholder="Ej: Juan, Cliente..."
                value={senderLabel}
                onChange={(e) => setSenderLabel(e.target.value)}
                className="bg-black/20 border-white/10"
              />
              <p className="text-xs text-muted-foreground">Si lo dejas vacío analizará todo el chat.</p>
            </div>

            <div className="space-y-2">
              <Label>¿Qué quieres saber?</Label>
              <Textarea 
                placeholder="Ej: Haz un resumen de los acuerdos a los que llegamos."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-black/20 border-white/10 min-h-[120px] resize-none"
              />
            </div>

            <Button 
              onClick={handleAnalyze}
              disabled={analyze.isPending || !importId || !query}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border-none"
            >
              {analyze.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generar Análisis
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="glass-panel col-span-1 lg:col-span-8 min-h-[500px] flex flex-col">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="font-display text-lg">Resultado del Análisis</CardTitle>
            <CardDescription>Respuesta generada por la IA basada en el contexto proporcionado.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 bg-black/10">
            {analyze.isPending ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 text-primary animate-pulse">
                <BrainCircuit className="w-12 h-12" />
                <p className="font-medium tracking-wide">Procesando y analizando miles de tokens...</p>
              </div>
            ) : result ? (
              <div className="prose prose-invert prose-emerald max-w-none 
                prose-headings:font-display prose-headings:text-emerald-400 
                prose-p:leading-relaxed prose-a:text-blue-400
                prose-strong:text-emerald-300">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <Sparkles className="w-16 h-16 mb-4" />
                <p className="text-xl font-display">Esperando tu consulta...</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
