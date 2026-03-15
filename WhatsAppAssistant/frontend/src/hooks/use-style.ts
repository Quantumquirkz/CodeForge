import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type StyleConfig } from "@shared/schema";
import { apiUrl } from "@/lib/api-base";

export function useStyle() {
  return useQuery({
    queryKey: [api.style.get.path],
    queryFn: async () => {
      const res = await fetch(apiUrl(api.style.get.path), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch style config");
      const data = await res.json();
      const parsed = api.style.get.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Style config parse failed", parsed.error);
        throw parsed.error;
      }
      return parsed.data;
    },
  });
}

export function useUpdateStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (style: Partial<StyleConfig>) => {
      const validated = api.style.update.input.parse(style);
      const res = await fetch(apiUrl(api.style.update.path), {
        method: api.style.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update style config");
      const data = await res.json();
      return api.style.update.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.style.get.path] });
    },
  });
}
