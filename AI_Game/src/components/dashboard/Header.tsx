import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button";
import { TabNavigation } from "./TabNavigation";

export function Header() {
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
      <TabNavigation />
      <div className="header-actions">
        <Button variant="ghost" ariaLabel="Configuración visual" icon={<Icon name="theme" className="icon" />} />
        <Button variant="ghost" ariaLabel="Ayuda" icon={<Icon name="help" className="icon" />} />
      </div>
    </header>
  );
}
