import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type ChatRules } from "@shared/schema";
import { apiUrl } from "@/lib/api-base";

export function useChats() {
  return useQuery({
    queryKey: [api.chats.list.path],
    queryFn: async () => {
      const res = await fetch(apiUrl(api.chats.list.path), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      const parsed = api.chats.list.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Chats list parse failed", parsed.error);
        throw parsed.error;
      }
      return parsed.data;
    },
  });
}

export function useUpdateChatRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rules }: { id: string; rules: ChatRules }) => {
      const path = buildUrl(api.chats.updateRules.path, { id });
      const url = apiUrl(path);
      const validated = api.chats.updateRules.input.parse(rules);
      const res = await fetch(url, {
        method: api.chats.updateRules.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update chat rules");
      const data = await res.json();
      return api.chats.updateRules.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    },
  });
}
