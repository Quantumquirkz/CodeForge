import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiUrl } from "@/lib/api-base";

export function useLogs(limit?: string) {
  return useQuery({
    queryKey: [api.logs.list.path, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit);

      const url = `${apiUrl(api.logs.list.path)}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      const parsed = api.logs.list.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Logs parse failed", parsed.error);
        throw parsed.error;
      }
      return parsed.data;
    },
    refetchInterval: 5000, // Poll logs every 5 seconds
  });
}
