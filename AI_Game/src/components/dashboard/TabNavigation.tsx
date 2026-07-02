import { Icon } from "../ui/Icon";

const tabs = [
  { id: "board", label: "Tablero interactivo", icon: "users", active: true },
  { id: "heuristic", label: "Búsqueda heurística", icon: "search", active: false },
  { id: "adversarial", label: "Juego adversario", icon: "users", active: false }
] as const;

export function TabNavigation() {
  return (
    <nav className="tab-nav" aria-label="Secciones del dashboard">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" className={`tab-pill${tab.active ? " tab-pill--active" : ""}`}>
          <Icon name={tab.icon} className="icon" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
