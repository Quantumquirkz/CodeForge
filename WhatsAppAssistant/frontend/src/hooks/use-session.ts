import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { apiUrl } from "@/lib/api-base";

export function useSession() {
  return useQuery({
    queryKey: [api.session.get.path],
    queryFn: async () => {
      const res = await fetch(apiUrl(api.session.get.path), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      const parsed = api.session.get.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Session parse failed", parsed.error);
        throw parsed.error;
      }
      return parsed.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "connecting") return 500;
      if (status === "connected") return 3000;
      return 5000;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(api.session.start.path), {
        method: api.session.start.method,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data as { detail?: string })?.detail ?? "Failed to start session";
        throw new Error(msg);
      }
      return api.session.start.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.session.get.path] });
    },
  });
}

export function useStartPairingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await fetch(apiUrl(api.session.startPairing.path), {
        method: api.session.startPairing.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data as { detail?: string })?.detail ?? "Failed to start pairing";
        throw new Error(msg);
      }
      return api.session.get.responses[200].parse({ ...data, status: data.status ?? "connecting", qr: data.qr ?? null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.session.get.path] });
    },
  });
}

export function useLogoutSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(api.session.logout.path), {
        method: api.session.logout.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to logout");
      const data = await res.json();
      return api.session.logout.responses[200].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.session.get.path] });
    },
  });
}
