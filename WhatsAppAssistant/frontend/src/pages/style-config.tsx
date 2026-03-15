import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { styleSchema, type StyleConfig as StyleConfigType } from "@shared/schema";
import { useStyle, useUpdateStyle } from "@/hooks/use-style";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Sparkles } from "lucide-react";

export default function StyleConfig() {
  const { data: styleData, isLoading } = useStyle();
  const updateStyle = useUpdateStyle();
  const { toast } = useToast();

  const form = useForm<StyleConfigType>({
    resolver: zodResolver(styleSchema),
    defaultValues: {
      owner_name: "",
      tone: "",
      formality: "",
      brevity: "",
      emoji_policy: "",
      signature_phrases: [],
      writing_rules: [],
    },
  });

  useEffect(() => {
    if (styleData) {
      form.reset(styleData);
    }
  }, [styleData, form]);

  const onSubmit = (values: StyleConfigType) => {
    updateStyle.mutate(values, {
      onSuccess: () => {
        toast({ title: "Guardado exitosamente", description: "El estilo del asistente ha sido actualizado." });
      },
      onError: (err) => {
        toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
      }
    });
  };

  const parseArrayText = (text: string) => text.split('\n').filter(s => s.trim() !== '');
  const formatArrayText = (arr: string[]) => arr.join('\n');

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <PageHeader 
        title="Estilo e Identidad" 
        description="Configura la personalidad, el tono y las reglas de escritura de tu asistente."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className="glass-panel border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Identidad Principal
              </CardTitle>
              <CardDescription>Información básica sobre quién representa el bot.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Dueño/Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez o TechCorp" className="bg-black/20 border-white/10 focus-visible:ring-primary/50" {...field} />
                    </FormControl>
                    <FormDescription>El asistente usará este nombre como referencia de su creador.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="font-display text-lg">Tono y Actitud</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tono General</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Amable, directo, entusiasta..." className="bg-black/20 border-white/10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="formality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de Formalidad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Selecciona un nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="muy_formal">Muy Formal (Usted, sin contracciones)</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="casual">Casual (Tú, coloquial)</SelectItem>
                          <SelectItem value="muy_casual">Muy Casual (Cercano, como amigo)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brevity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extensión de Respuestas</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Selecciona extensión" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="muy_breve">Muy breves (1-2 oraciones)</SelectItem>
                          <SelectItem value="conciso">Conciso (Al grano)</SelectItem>
                          <SelectItem value="detallado">Detallado (Explicaciones completas)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emoji_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uso de Emojis</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/20 border-white/10">
                            <SelectValue placeholder="Selecciona política" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ninguno">Nunca usar emojis</SelectItem>
                          <SelectItem value="escaso">Ocasional (1-2 por mensaje largo)</SelectItem>
                          <SelectItem value="frecuente">Frecuente (Muy expresivo)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="font-display text-lg">Reglas Avanzadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="signature_phrases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frases Típicas (Una por línea)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="¡Claro que sí!&#10;Te comento:"
                          className="bg-black/20 border-white/10 min-h-[120px] resize-none"
                          value={formatArrayText(field.value)}
                          onChange={(e) => field.onChange(parseArrayText(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Expresiones que el bot debería usar frecuentemente.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="writing_rules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reglas de Escritura (Una por línea)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="No usar signos de exclamación múltiples.&#10;Evitar saludos largos."
                          className="bg-black/20 border-white/10 min-h-[120px] resize-none"
                          value={formatArrayText(field.value)}
                          onChange={(e) => field.onChange(parseArrayText(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Instrucciones explícitas para el LLM al generar texto.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              size="lg"
              disabled={updateStyle.isPending}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 min-w-[200px]"
            >
              {updateStyle.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Guardar Configuración
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
