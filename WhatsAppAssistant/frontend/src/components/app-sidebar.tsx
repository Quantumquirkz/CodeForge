import { Link, useLocation } from "wouter";
import { 
  MessageSquare, 
  Settings2, 
  Upload, 
  BrainCircuit, 
  SendHorizontal, 
  LayoutDashboard,
  Bot
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Estilo e Identidad", url: "/estilo", icon: Settings2 },
  { title: "Reglas de Chats", url: "/chats", icon: MessageSquare },
  { title: "Importar Chats", url: "/importar", icon: Upload },
  { title: "Analizar Contexto", url: "/analizar", icon: BrainCircuit },
  { title: "Enviar Mensaje", url: "/enviar", icon: SendHorizontal },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-white/5 bg-sidebar-background">
      <SidebarHeader className="p-4 flex flex-row items-center gap-3 border-b border-white/5">
        <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 shadow-lg shadow-primary/20">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg leading-tight tracking-wide text-white">
            WhatsApp<span className="text-primary">A</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            AI Assistant
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        transition-all duration-300 rounded-lg my-0.5 px-3 py-5
                        ${isActive 
                          ? 'bg-primary/10 text-primary hover:bg-primary/15 font-medium border border-primary/20 shadow-sm' 
                          : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
