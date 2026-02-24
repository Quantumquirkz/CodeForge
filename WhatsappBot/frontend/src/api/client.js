import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const envToken = import.meta.env.VITE_ADMIN_API_TOKEN;
  const storedToken = typeof window !== "undefined" ? window.localStorage.getItem("admin_api_token") : "";
  const token = (envToken || storedToken || "").trim();
  if (token) {
    config.headers["X-Admin-Token"] = token;
  }
  return config;
});

export const api = {
  getConfig: async () => (await http.get("/api/v1/admin/config")).data,
  updateConfig: async (payload) => (await http.put("/api/v1/admin/config", payload)).data,

  getPersona: async () => (await http.get("/api/v1/admin/persona")).data,
  updatePersona: async (payload) => (await http.put("/api/v1/admin/persona", payload)).data,

  listSamples: async () => (await http.get("/api/v1/admin/samples")).data.items,
  addSample: async (payload) => (await http.post("/api/v1/admin/samples", payload)).data,
  deleteSample: async (id) => (await http.delete(`/api/v1/admin/samples/${id}`)).data,

  rebuildStyle: async () => (await http.post("/api/v1/admin/persona/rebuild-style")).data,
  getStylePreview: async () => (await http.get("/api/v1/admin/persona/style-preview")).data,

  getSecurity: async () => (await http.get("/api/v1/system/security")).data,
  getHealth: async () => (await http.get("/api/v1/system/health")).data,
};
