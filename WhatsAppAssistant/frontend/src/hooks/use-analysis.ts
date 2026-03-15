import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { apiUrl } from "@/lib/api-base";

type AnalyzeParams = z.infer<typeof api.analysis.analyze.input>;

export function useAnalyze() {
  return useMutation({
    mutationFn: async (params: AnalyzeParams) => {
      const validated = api.analysis.analyze.input.parse(params);
      const res = await fetch(apiUrl(api.analysis.analyze.path), {
        method: api.analysis.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to analyze chat");
      const data = await res.json();
      return api.analysis.analyze.responses[200].parse(data);
    },
  });
}
