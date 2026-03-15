import { useState } from "react";
import { useChats, useUpdateChatRules } from "@/hooks/use-chats";
import { type ChatRules } from "@shared/schema";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, User, BotMessageSquare } from "lucide-react";

export default function ChatsConfig() {
  const { data: chats, isLoading } = useChats();
  const updateRules = useUpdateChatRules();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredChats = chats?.filter((chat) => {
    const name = chat.name ?? "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      chat.wa_chat_id.includes(search)
    );
  }) ?? [];

  const handleRuleChange = (chatId: string, field: keyof ChatRules, value: string) => {
    const chat = chats?.find((c) => String(c.id) === chatId);
    if (!chat) return;

    const newRules: ChatRules = { ...chat.rules, [field]: value };
    
    // Clear keyword if rule changes away from 'keyword'
    if (field === 'respond' && value !== 'keyword') {
      newRules.keyword = '';
    }

    updateRules.mutate({ id: String(chat.id), rules: newRules }, {
      onSuccess: () => toast({ title: "Reglas actualizadas", description: `Guardado para ${chat.name ?? "chat"}` }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <PageHeader 
        title="Reglas de Chats" 
        description="Define cuándo y cómo debe responder el asistente en cada conversación."
      >
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar chat..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/20 border-white/10"
          />
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      ) : filteredChats.length === 0 ? (
        <Card className="glass-panel border-dashed border-white/10 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BotMessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No se encontraron chats sincronizados.</p>
            <p className="text-sm opacity-60">Asegúrate de que WhatsApp esté conectado y recibe mensajes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredChats.map((chat) => (
            <Card key={String(chat.id)} className="glass-panel overflow-visible group hover:border-primary/30 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`p-3 rounded-full ${chat.is_group ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {chat.is_group ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate text-white">{chat.name ?? "Sin nombre"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-black/30 border-white/10 text-xs text-muted-foreground font-mono">
                        {chat.wa_chat_id.replace('@s.whatsapp.net', '').replace('@g.us', '')}
                      </Badge>
                      {chat.is_group && <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-none text-[10px]">Grupo</Badge>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="w-full md:w-[220px]">
                    <Select 
                      value={chat.rules.respond} 
                      onValueChange={(val) => handleRuleChange(String(chat.id), "respond", val)}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="Comportamiento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="respond_always">Responder Siempre</SelectItem>
                        <SelectItem value="on_mention">Solo al Mencionarlo</SelectItem>
                        <SelectItem value="keyword">Palabra Clave</SelectItem>
                        <SelectItem value="never">Nunca Responder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {chat.rules.respond === 'keyword' && (
                    <div className="w-full md:w-[200px] animate-in slide-in-from-left-2">
                      <Input 
                        placeholder="Palabra mágica..."
                        value={chat.rules.keyword || ""}
                        onChange={(e) => handleRuleChange(String(chat.id), "keyword", e.target.value)}
                        className="bg-black/20 border-primary/30 focus-visible:ring-primary/50"
                      />
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
