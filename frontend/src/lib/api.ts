const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8090";

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }});
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export type CreateVideoRequest = {
  prompt: string;
  resolution: string;
  duration_seconds: number;
  seed?: number;
};
export type JobStatus = { job_id: string; status: string; message?: string; eta_seconds?: number };
export type JobResult = { job_id: string; file_url: string; size_bytes?: number };
export type CostEstimate = { resolution: string; duration_seconds: number; cost_usd: number; min_cost_usd?: number; max_cost_usd?: number; breakdown: string; warning?: string };

export const api = {
  createVideo: (body: CreateVideoRequest) => json<JobStatus>(`${BASE}/api/videos`, { method: "POST", body: JSON.stringify(body) }),
  status: (jobId: string) => json<JobStatus>(`${BASE}/api/videos/${jobId}/status`),
  result: (jobId: string) => json<JobResult>(`${BASE}/api/videos/${jobId}/result`),
  cost: (resolution: string, duration_seconds: number) => json<CostEstimate>(`${BASE}/api/cost?resolution=${encodeURIComponent(resolution)}&duration_seconds=${duration_seconds}`),
};
