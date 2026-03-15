import { useState } from "react";
import { useChats } from "@/hooks/use-chats";
import { useSendMessage } from "@/hooks/use-messages";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SendHorizontal, Loader2, MessageSquare } from "lucide-react";

export default function SendMessage() {
  const { data: chats } = useChats();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const [chatId, setChatId] = useState<string>("");
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!chatId) {
      toast({ title: "Falta destinatario", description: "Selecciona un chat", variant: "destructive" });
      return;
    }
    if (!text.trim()) {
      toast({ title: "Mensaje vacío", description: "Escribe algo para enviar", variant: "destructive" });
      return;
    }

    sendMessage.mutate({ chatId, text }, {
      onSuccess: () => {
        toast({ title: "Mensaje Enviado", description: "El mensaje ha sido puesto en la cola de WhatsApp." });
        setText("");
      },
      onError: (err) => {
        toast({ title: "Error al enviar", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <PageHeader 
        title="Enviar Mensaje" 
        description="Envía mensajes manuales a través de WhatsApp."
      />

      <Card className="glass-panel border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="border-b border-white/5 pb-6">
          <CardTitle className="font-display flex items-center gap-2 text-2xl">
            <MessageSquare className="w-6 h-6 text-primary" />
            Redactar Mensaje
          </CardTitle>
          <CardDescription>El mensaje se enviará directamente desde el número conectado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Destinatario (Chat / Grupo)</Label>
            <Select value={chatId} onValueChange={setChatId}>
              <SelectTrigger className="bg-black/30 border-white/10 h-12 text-base">
                <SelectValue placeholder="Selecciona un destinatario..." />
              </SelectTrigger>
              <SelectContent>
                {chats?.map((c) => (
                  <SelectItem key={String(c.id)} value={c.wa_chat_id}>
                    {c.name ?? "Sin nombre"} {c.is_group ? "(Grupo)" : ""}
                  </SelectItem>
                ))}
                {(!chats || chats.length === 0) && (
                  <SelectItem value="none" disabled>No hay chats disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Contenido del Mensaje</Label>
            <Textarea 
              placeholder="Escribe tu mensaje aquí..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-black/30 border-white/10 min-h-[200px] resize-none text-base p-4 focus-visible:ring-primary/50"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSend}
              disabled={sendMessage.isPending || !chatId || !text}
              size="lg"
              className="w-full sm:w-auto px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25 border-none h-12 text-lg font-medium"
            >
              {sendMessage.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <SendHorizontal className="w-5 h-5 mr-2" />}
              Enviar ahora
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
