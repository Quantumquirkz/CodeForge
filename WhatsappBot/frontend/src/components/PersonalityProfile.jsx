import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function PersonalityProfile() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["persona"], queryFn: api.getPersona });
  const mutation = useMutation({
    mutationFn: api.updatePersona,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["persona"] }),
  });

  const [message, setMessage] = useState("");

  if (isLoading) return <div className="card">Loading persona...</div>;

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        mutation.mutate({
          tone: formData.get("tone"),
          formality: Number(formData.get("formality")),
          humor_level: Number(formData.get("humor_level")),
          brevity_level: Number(formData.get("brevity_level")),
          signature_phrases: String(formData.get("signature_phrases")).split("|").map((x) => x.trim()).filter(Boolean),
          forbidden_phrases: String(formData.get("forbidden_phrases")).split("|").map((x) => x.trim()).filter(Boolean),
          writing_rules: String(formData.get("writing_rules")).split("|").map((x) => x.trim()).filter(Boolean),
        }, {
          onSuccess: () => setMessage("Persona saved."),
          onError: () => setMessage("Failed to save persona."),
        });
      }}
    >
      <h3>Personality Profile</h3>
      <label>Tone<input name="tone" defaultValue={data.tone} /></label>
      <label>Formality (1-10)<input name="formality" type="number" defaultValue={data.formality} /></label>
      <label>Humor (1-10)<input name="humor_level" type="number" defaultValue={data.humor_level} /></label>
      <label>Brevity (1-10)<input name="brevity_level" type="number" defaultValue={data.brevity_level} /></label>
      <label>Signature phrases (use | separator)
        <input name="signature_phrases" defaultValue={data.signature_phrases.join(" | ")} />
      </label>
      <label>Forbidden phrases (use | separator)
        <input name="forbidden_phrases" defaultValue={data.forbidden_phrases.join(" | ")} />
      </label>
      <label>Writing rules (use | separator)
        <textarea name="writing_rules" defaultValue={data.writing_rules.join(" | ")} rows={3} />
      </label>
      <button type="submit">Save Persona</button>
      {message && <p className="small">{message}</p>}
    </form>
  );
}
