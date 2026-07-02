import type { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
};

export function KpiCard({ label, value, description, icon }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <div className="kpi-card__icon">{icon}</div>
      <div>
        <span className="eyebrow">{label}</span>
        <strong className="kpi-card__value">{value}</strong>
        <p className="kpi-card__text">{description}</p>
      </div>
    </article>
  );
}
