import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiUrl } from "@/lib/api-base";

export function useImports() {
  return useQuery({
    queryKey: [api.imports.list.path],
    queryFn: async () => {
      const res = await fetch(apiUrl(api.imports.list.path), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch imports");
      const data = await res.json();
      const parsed = api.imports.list.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Imports list parse failed", parsed.error);
        throw parsed.error;
      }
      return parsed.data;
    },
  });
}

export function useUploadImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(apiUrl(api.imports.upload.path), {
        method: api.imports.upload.method,
        body: formData, // fetch sets correct multipart header automatically
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload import");
      const data = await res.json();
      return api.imports.upload.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.imports.list.path] });
    },
  });
}
