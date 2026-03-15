import { useSession } from "@/hooks/use-session";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

export function ConnectionStatus() {
  const { data: session, isLoading, isError } = useSession();

  if (isLoading) {
    return (
      <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-white/5 py-1.5 px-3 rounded-full">
        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
        Comprobando...
      </Badge>
    );
  }

  if (isError || !session) {
    return (
      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 py-1.5 px-3 rounded-full">
        <WifiOff className="w-3.5 h-3.5 mr-2" />
        Error de conexión
      </Badge>
    );
  }

  switch (session.status) {
    case "connected":
      return (
        <Badge variant="default" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 py-1.5 px-3 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Wifi className="w-3.5 h-3.5 mr-2" />
          Conectado
        </Badge>
      );
    case "connecting":
      return (
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 py-1.5 px-3 rounded-full">
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          {session.pairingCode ? "Introduce código..." : "Escaneando QR..."}
        </Badge>
      );
    case "disconnected":
    default:
      return (
        <Badge variant="outline" className="bg-slate-800/80 text-slate-300 border-white/10 py-1.5 px-3 rounded-full">
          <WifiOff className="w-3.5 h-3.5 mr-2 opacity-50" />
          Desconectado
        </Badge>
      );
  }
}
