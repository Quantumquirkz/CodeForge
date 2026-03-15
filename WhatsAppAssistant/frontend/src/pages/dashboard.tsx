import { useState } from "react";
import { useSession, useStartSession, useStartPairingSession, useLogoutSession } from "@/hooks/use-session";
import { useLogs } from "@/hooks/use-logs";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { QrCode, PowerOff, Loader2, MessageSquareText, ShieldAlert, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: session, isLoading: isSessionLoading } = useSession();
  const { data: logs, isLoading: isLogsLoading } = useLogs("10");
  const startSession = useStartSession();
  const startPairingSession = useStartPairingSession();
  const logoutSession = useLogoutSession();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPairing, setShowPairing] = useState(false);

  const handleStart = () => {
    startSession.mutate(undefined, {
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleStartPairing = () => {
    const normalized = phoneNumber.replace(/\D/g, "");
    if (normalized.length < 10) {
      toast({ title: "Número inválido", description: "Ingresa tu número con código de país (ej: 521234567890)", variant: "destructive" });
      return;
    }
    startPairingSession.mutate(phoneNumber.trim(), {
      onSuccess: () => toast({ title: "Código enviado", description: "Revisa WhatsApp en tu teléfono." }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleLogout = () => {
    logoutSession.mutate(undefined, {
      onSuccess: () => toast({ title: "Sesión cerrada", description: "WhatsApp ha sido desconectado." }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard" 
        description="Resumen de la conexión y actividad reciente del asistente."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Connection Status Card */}
        <Card className="glass-panel col-span-1 lg:col-span-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Estado de Conexión
            </CardTitle>
            <CardDescription>Gestiona el enlace con tu cuenta de WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 min-h-[300px]">
            {isSessionLoading ? (
              <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            ) : session?.status === "disconnected" ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-muted/30 rounded-2xl mx-auto flex items-center justify-center border border-white/5">
                  <QrCode className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                  El bot no está conectado a WhatsApp en este momento.
                </p>
                {!showPairing ? (
                  <div className="space-y-3 w-full">
                    <Button 
                      onClick={handleStart} 
                      disabled={startSession.isPending}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    >
                      {startSession.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                      Generar QR de Conexión
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowPairing(true)}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Vincular con código
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 w-full text-left">
                    <Input
                      placeholder="Número con código de país (ej: 521234567890)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPairing(false)}
                      >
                        Atrás
                      </Button>
                      <Button
                        onClick={handleStartPairing}
                        disabled={startPairingSession.isPending}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600"
                      >
                        {startPairingSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Obtener código"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : session?.status === "connecting" && session.qr ? (
              <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="bg-white p-4 rounded-2xl shadow-xl inline-block ring-8 ring-primary/20">
                  <img src={session.qr} alt="QR de WhatsApp" className="w-[200px] h-[200px]" />
                </div>
                <p className="text-sm font-medium text-emerald-400 animate-pulse">
                  Escanea el QR con WhatsApp...
                </p>
              </div>
            ) : session?.status === "connecting" && session.pairingCode ? (
              <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="bg-white/10 p-6 rounded-2xl border-2 border-emerald-500/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Código de vinculación</p>
                  <p className="text-4xl font-mono font-bold text-emerald-400 tracking-[0.3em]">
                    {session.pairingCode}
                  </p>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground max-w-[240px] mx-auto">
                  <p>1. Abre WhatsApp en tu teléfono</p>
                  <p>2. Dispositivos vinculados → Vincular con número</p>
                  <p>3. Ingresa este código de 8 dígitos</p>
                </div>
              </div>
            ) : session?.status === "connecting" ? (
              <div className="text-center space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary/70 mx-auto" />
                <p className="text-sm text-muted-foreground">Iniciando cliente de WhatsApp...</p>
              </div>
            ) : session?.status === "connected" ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center border-4 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <MessageSquareText className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Conectado y Listo</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                    El asistente está monitoreando los mensajes entrantes.
                  </p>
                </div>
                <Button 
                  onClick={handleLogout} 
                  disabled={logoutSession.isPending}
                  variant="destructive"
                  className="w-full shadow-lg shadow-destructive/20"
                >
                  {logoutSession.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PowerOff className="w-4 h-4 mr-2" />}
                  Desconectar
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Activity Logs Card */}
        <Card className="glass-panel col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-blue-400" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimos mensajes procesados por el asistente</CardDescription>
          </CardHeader>
          <CardContent>
            {isLogsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />
                ))}
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                <p className="text-muted-foreground">No hay actividad reciente registrada.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider
                          ${log.role === 'assistant' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                          {log.role}
                        </span>
                        <span className="font-semibold text-sm text-slate-200">{log.chat_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(new Date(log.timestamp), "HH:mm:ss")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed break-words">{log.content}</p>
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
