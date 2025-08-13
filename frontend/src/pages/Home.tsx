import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, CostEstimate } from "../lib/api";
import { useToast } from "../components/ToastProvider";

const RESOLUTIONS = [
  "480x480","480x854","854x480","720x720","720x1280","1280x720","1080x1080","1080x1920","1920x1080"
];
 
const MAX_BY_RES: Record<string, number> = { "1920x1080": 10 };
 
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState("480x480");
  const [duration, setDuration] = useState(5);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCapWarning, setShowCapWarning] = useState(true);
  const nav = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;
    setEstimateLoading(true);
    api.cost(resolution, duration).then((e) => {
      if (active) setEstimate(e);
    }).catch(() => {
      if (active) addToast({ title: "Cost unavailable", description: "Failed to fetch estimate.", type: "error" });
    }).finally(()=>{ if (active) setEstimateLoading(false); });
    return () => { active = false; };
  }, [resolution, duration]);

  useEffect(() => {
    // Reset cap warning when resolution changes
    setShowCapWarning(true);
  }, [resolution]);

  const disabled = useMemo(() => {
    const cap = MAX_BY_RES[resolution];
    if (!prompt) return true;
    if (duration < 1 || duration > 20) return true;
    if (cap && duration > cap) return true;
    return false;
  }, [prompt, duration, resolution]);

  async function submit() {
    setLoading(true);
    try {
  const payload = { prompt, resolution, duration_seconds: duration, seed };
  // Save last request so user can resubmit in case of failure
  localStorage.setItem("lastRequest", JSON.stringify(payload));
  const job = await api.createVideo(payload);
  addToast({ title: "Job created", description: `ID: ${job.job_id}`, type: "success", duration: 2500 });
      nav(`/status/${job.job_id}`);
    } catch (e: any) {
  addToast({ title: "Failed to create job", description: e.message ?? String(e), type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="p-4 sm:p-6 space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Prompt</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 min-h-[120px] text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-500/30"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want..."
            />
          </div>
        </div>

  <div className="rounded-xl border bg-white shadow-sm p-4 sm:p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
              <div className="flex flex-wrap gap-2">
                {RESOLUTIONS.map((r) => (
      <button
                    key={r}
                    type="button"
                    onClick={() => setResolution(r)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      resolution === r
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700 dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700 dark:hover:bg-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration: {duration}s</label>
              <input
                className="w-full accent-blue-600"
                type="range"
                min={1}
                max={20}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value || "0"))}
              />
              <div className="mt-2">
                <input
                  className="w-full rounded-md border border-gray-300 p-2 dark:bg-slate-800 dark:border-slate-700"
                  type="number"
                  min={1}
                  max={20}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value || "0"))}
                />
                {MAX_BY_RES[resolution] && duration > MAX_BY_RES[resolution] ? (
                  <>
                    <div className="text-xs text-red-600 mt-1">Max duration for {resolution} is {MAX_BY_RES[resolution]}s</div>
                    {showCapWarning && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:border-red-900/40 dark:text-red-200 p-3 text-xs flex items-start justify-between gap-3">
                        <div>
                          Duration exceeds the maximum allowed for this resolution. Reduce seconds or pick a lower resolution.
                        </div>
                        <button className="text-red-700 hover:underline dark:text-red-300" onClick={()=>setShowCapWarning(false)}>Dismiss</button>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seed (optional)</label>
              <input
                className="w-full rounded-md border border-gray-300 p-2 dark:bg-slate-800 dark:border-slate-700"
                type="number"
                value={seed ?? ""}
                onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Randomized if empty"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              disabled={disabled || loading}
              onClick={submit}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {loading ? "Submitting..." : "Generate Video"}
            </button>
            <div className="text-xs text-gray-500">Videos up to 20s. 1080p limited to 10s.</div>
          </div>
        </div>
      </div>

      {/* Right: Cost card */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border bg-white shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
          <div className="text-sm text-gray-500">Estimated Cost</div>
          {estimateLoading ? (
            <div className="mt-2 animate-pulse space-y-2">
              <div className="h-8 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-56 bg-gray-200 dark:bg-slate-800 rounded" />
            </div>
          ) : estimate ? (
            <div className="mt-2">
              <div className="text-3xl font-semibold tracking-tight">${estimate.cost_usd.toFixed(2)}</div>
              <div className="mt-2 text-sm text-gray-600">{estimate.breakdown}</div>
              {estimate.warning ? <div className="mt-2 text-amber-700 text-sm">{estimate.warning}</div> : null}
            </div>
          ) : (
            <div className="text-sm text-gray-500 mt-2">Calculating...</div>
          )}
          <div className="mt-4 text-xs text-gray-400">Costs are estimates and may vary based on usage.</div>
        </div>
      </div>
    </div>
  );
}
