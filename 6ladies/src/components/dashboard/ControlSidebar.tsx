import type { GameMode, PlayerColor, Strategy } from "../../types/game";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { SelectControl } from "../ui/SelectControl";

type ControlSidebarProps = {
  mode: GameMode;
  humanColor: PlayerColor;
  strategy: Strategy;
  gameOver: boolean;
  autoPlayActive: boolean;
  aiThinking: boolean;
  onModeChange: (value: string) => void;
  onHumanColorChange: (value: string) => void;
  onStrategyChange: (value: string) => void;
  onReset: () => void;
  onAnalyze: () => void;
  onAdvance: () => void;
  onPlayAi: () => void;
};

export function ControlSidebar(props: ControlSidebarProps) {
  return (
    <div className="sidebar-card">
      <section>
        <span className="eyebrow">Acciones</span>
        <div className="sidebar-actions">
          <Button variant="primary" icon={<Icon name="refresh" className="icon" />} onClick={props.onReset}>
            Reiniciar partida
          </Button>
          <Button
            variant="secondary"
            icon={<Icon name="spark" className="icon" />}
            onClick={props.onAnalyze}
            disabled={props.gameOver}
          >
            Analizar con A*
          </Button>
          <Button
            variant="secondary"
            icon={<Icon name="play" className="icon" />}
            onClick={props.onAdvance}
            disabled={props.gameOver}
          >
            Avanzar plan
          </Button>
          <Button
            variant="secondary"
            icon={<Icon name="bot" className="icon" />}
            onClick={props.onPlayAi}
            disabled={props.gameOver || props.aiThinking}
          >
            {props.autoPlayActive ? "IA en marcha" : "Jugar IA"}
          </Button>
        </div>
      </section>

      <section className="sidebar-config">
        <span className="eyebrow">Configuración</span>
        <SelectControl
          label="Modo de juego"
          value={props.mode}
          options={[
            { value: "human-vs-ai", label: "Humano vs IA" },
            { value: "ai-vs-ai", label: "IA vs IA" }
          ]}
          onChange={props.onModeChange}
          adornment={<Icon name="users" className="icon icon--tiny" />}
        />
        <SelectControl
          label="Color humano"
          value={props.humanColor}
          options={[
            { value: "red", label: "Rojo" },
            { value: "black", label: "Negro" }
          ]}
          onChange={props.onHumanColorChange}
          adornment={<span className={`color-dot color-dot--${props.humanColor}`} />}
        />
        <SelectControl
          label="Estrategia IA"
          value={props.strategy}
          options={[
            { value: "minimax", label: "Minimax" },
            { value: "astar", label: "A* (plan)" }
          ]}
          onChange={props.onStrategyChange}
          adornment={<Icon name="chart" className="icon icon--tiny" />}
        />
      </section>
    </div>
  );
}
