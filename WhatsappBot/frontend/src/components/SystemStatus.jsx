import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function SystemStatus() {
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: api.getHealth });
  const { data: security } = useQuery({ queryKey: ["security"], queryFn: api.getSecurity });

  return (
    <div className="card">
      <h3>System Status</h3>
      <pre>{JSON.stringify(health || {}, null, 2)}</pre>
      <pre>{JSON.stringify(security || {}, null, 2)}</pre>
    </div>
  );
}
