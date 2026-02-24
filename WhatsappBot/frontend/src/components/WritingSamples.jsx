import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function WritingSamples() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["samples"], queryFn: api.listSamples });
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");
  const [language, setLanguage] = useState("es");
  const [tags, setTags] = useState("");

  const createMutation = useMutation({
    mutationFn: api.addSample,
    onSuccess: () => {
      setContent("");
      setTags("");
      queryClient.invalidateQueries({ queryKey: ["samples"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSample,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["samples"] }),
  });

  if (isLoading) return <div className="card">Loading samples...</div>;

  return (
    <div className="card">
      <h3>Writing Samples</h3>
      <label>Source<input value={source} onChange={(e) => setSource(e.target.value)} /></label>
      <label>Language<input value={language} onChange={(e) => setLanguage(e.target.value)} /></label>
      <label>Tags (| separator)<input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
      <label>Sample text
        <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
      </label>
      <button
        onClick={() =>
          createMutation.mutate({
            source,
            content,
            language,
            tags: tags.split("|").map((x) => x.trim()).filter(Boolean),
          })
        }
      >
        Add Sample
      </button>

      <p className="small">{data.length} samples loaded.</p>
      {data.map((sample) => (
        <div key={sample.id} style={{ borderTop: "1px solid #eee", marginTop: 8, paddingTop: 8 }}>
          <strong>#{sample.id}</strong> [{sample.language}] {sample.source}
          <p>{sample.content}</p>
          <button className="secondary" onClick={() => deleteMutation.mutate(sample.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
