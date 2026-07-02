import { Badge } from "../ui/Badge";

type CurrentModeCardProps = {
  text: string;
};

export function CurrentModeCard({ text }: CurrentModeCardProps) {
  return (
    <section className="analytics-card">
      <span className="eyebrow">Modo actual</span>
      <strong className="analytics-card__headline">{text}</strong>
      <p className="analytics-card__text">Puedes jugar y analizar simultáneamente.</p>
      <Badge tone="success">Activo</Badge>
    </section>
  );
}
