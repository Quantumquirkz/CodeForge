import type { ReactNode } from "react";

type DashboardLayoutProps = {
  header: ReactNode;
  summary: ReactNode;
  kpis: ReactNode;
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  bottom?: ReactNode;
};

export function DashboardLayout({ header, summary, kpis, left, center, right, bottom }: DashboardLayoutProps) {
  return (
    <div className="dashboard-shell">
      {header}
      <section className="top-grid">
        {summary}
        {kpis}
      </section>
      <main className="main-grid">
        <aside>{left}</aside>
        <section>{center}</section>
        <aside>{right}</aside>
      </main>
      {bottom ? <section className="bottom-grid">{bottom}</section> : null}
    </div>
  );
}
