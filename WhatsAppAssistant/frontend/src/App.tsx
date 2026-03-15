import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Pages
import Dashboard from "@/pages/dashboard";
import StyleConfig from "@/pages/style-config";
import ChatsConfig from "@/pages/chats-config";
import ImportChat from "@/pages/import-chat";
import Analyze from "@/pages/analyze";
import SendMessage from "@/pages/send-message";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/estilo" component={StyleConfig}/>
      <Route path="/chats" component={ChatsConfig}/>
      <Route path="/importar" component={ImportChat}/>
      <Route path="/analizar" component={Analyze}/>
      <Route path="/enviar" component={SendMessage}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full overflow-hidden bg-background">
            <AppSidebar />
            <div className="flex flex-col flex-1 relative min-w-0">
              {/* Optional ambient background glows */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
              
              <header className="flex items-center justify-between p-4 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-10">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="text-white hover:bg-white/10 transition-colors" />
                <div className="flex items-center gap-4">
                  {/* Additional header items could go here */}
                </div>
              </header>
              <main className="flex-1 overflow-auto custom-scrollbar relative z-0">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
