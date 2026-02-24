import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function PromptPreview() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["style"], queryFn: api.getStylePreview });
  const mutation = useMutation({
    mutationFn: api.rebuildStyle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["style"] });
      queryClient.invalidateQueries({ queryKey: ["samples"] });
    },
  });

  if (isLoading) return <div className="card">Loading style preview...</div>;

  return (
    <div className="card">
      <h3>Prompt Preview</h3>
      <button onClick={() => mutation.mutate()}>Rebuild Style Guide</button>
      <p className="small">Sample count: {data.sample_count}</p>
      <pre>{data.style_preview}</pre>
      <pre>{JSON.stringify(data.signals, null, 2)}</pre>
    </div>
  );
}
