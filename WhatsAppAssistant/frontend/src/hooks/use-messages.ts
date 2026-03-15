import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { apiUrl } from "@/lib/api-base";

type SendMessageParams = z.infer<typeof api.messages.send.input>;

export function useSendMessage() {
  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      const validated = api.messages.send.input.parse(params);
      const res = await fetch(apiUrl(api.messages.send.path), {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      return api.messages.send.responses[200].parse(data);
    },
  });
}
