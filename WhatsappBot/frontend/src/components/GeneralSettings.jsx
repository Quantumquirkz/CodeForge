import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../api/client";

const configSchema = z.object({
  bot_name: z.string().min(1),
  default_language: z.string().min(2),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().int().min(1).max(4000),
  context_enabled: z.boolean(),
  context_memory_size: z.number().int().min(1).max(100),
  response_length_policy: z.enum(["short", "balanced", "long"]),
  emoji_policy: z.enum(["none", "moderate", "high"]),
});

export function GeneralSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["config"], queryFn: api.getConfig });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: api.updateConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["config"] }),
  });

  if (isLoading) return <div className="card">Loading config...</div>;

  const save = (formData) => {
    const payload = {
      bot_name: formData.get("bot_name"),
      default_language: formData.get("default_language"),
      temperature: Number(formData.get("temperature")),
      max_tokens: Number(formData.get("max_tokens")),
      context_enabled: formData.get("context_enabled") === "on",
      context_memory_size: Number(formData.get("context_memory_size")),
      response_length_policy: formData.get("response_length_policy"),
      emoji_policy: formData.get("emoji_policy"),
    };

    const parsed = configSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError("");
    mutation.mutate(parsed.data);
  };

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        save(new FormData(e.currentTarget));
      }}
    >
      <h3>General Settings</h3>
      <label>Bot Name<input name="bot_name" defaultValue={data.bot_name} /></label>
      <label>Default Language<input name="default_language" defaultValue={data.default_language} /></label>
      <label>Temperature<input name="temperature" type="number" step="0.1" defaultValue={data.temperature} /></label>
      <label>Max Tokens<input name="max_tokens" type="number" defaultValue={data.max_tokens} /></label>
      <label>Context Enabled<input name="context_enabled" type="checkbox" defaultChecked={data.context_enabled} /></label>
      <label>Context Memory Size<input name="context_memory_size" type="number" defaultValue={data.context_memory_size} /></label>
      <label>Response Length
        <select name="response_length_policy" defaultValue={data.response_length_policy}>
          <option value="short">short</option>
          <option value="balanced">balanced</option>
          <option value="long">long</option>
        </select>
      </label>
      <label>Emoji Policy
        <select name="emoji_policy" defaultValue={data.emoji_policy}>
          <option value="none">none</option>
          <option value="moderate">moderate</option>
          <option value="high">high</option>
        </select>
      </label>
      <button type="submit">Save Config</button>
      {mutation.isSuccess && <p className="small">Config saved.</p>}
      {error && <p className="small">{error}</p>}
    </form>
  );
}
