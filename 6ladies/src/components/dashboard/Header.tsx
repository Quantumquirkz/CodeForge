import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button";
import { TabNavigation } from "./TabNavigation";

type HeaderProps = {
  activeTab: "board" | "heuristic" | "adversarial";
  onTabChange: (tab: "board" | "heuristic" | "adversarial") => void;
  onToggleTheme: () => void;
  onHelp: () => void;
  themeMode: "light" | "dark";
};

export function Header({ activeTab, onTabChange, onToggleTheme, onHelp, themeMode }: HeaderProps) {
  return (
    <header className="header-card">
      <div className="header-brand">
        <div className="brand-mark">
          <Icon name="crown" className="brand-mark__icon" />
        </div>
        <div>
          <h1 className="header-title">6 Damas en Esquina</h1>
          <p className="header-subtitle">
            Interfaz de análisis para explorar el juego, comparar decisiones y entender cómo se comportan A* y
            minimax sobre un tablero de 8x8.
          </p>
        </div>
      </div>
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <div className="header-actions">
        <Button
          variant="ghost"
          ariaLabel={themeMode === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
          icon={<Icon name="theme" className="icon" />}
          onClick={onToggleTheme}
        />
        <Button variant="ghost" ariaLabel="Ir a la ayuda del tablero" icon={<Icon name="help" className="icon" />} onClick={onHelp} />
      </div>
    </header>
  );
}
