import { Icon } from "../ui/Icon";

const tabs = [
  { id: "board", label: "Tablero interactivo", icon: "users" },
  { id: "heuristic", label: "Búsqueda heurística", icon: "search" },
  { id: "adversarial", label: "Juego adversario", icon: "users" }
] as const;

type TabId = (typeof tabs)[number]["id"];

type TabNavigationProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="tab-nav" aria-label="Secciones del dashboard">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-pill${activeTab === tab.id ? " tab-pill--active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          aria-pressed={activeTab === tab.id}
          aria-label={`Ir a ${tab.label}`}
        >
          <Icon name={tab.icon} className="icon" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
