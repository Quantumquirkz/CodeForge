import { ConnectionStatus } from "./connection-status";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b border-white/5">
      <div>
        <h1 className="text-3xl font-display font-bold text-gradient mb-1">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {children}
        <ConnectionStatus />
      </div>
    </div>
  );
}
