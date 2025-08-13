import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, JobStatus } from "../lib/api";
import { useToast } from "../components/ToastProvider";

export default function Status() {
  const { jobId } = useParams();
  const [status, setStatus] = useState<JobStatus | null>(null);
  const nav = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    let timer: any;
    async function tick() {
      if (!jobId) return;
      try {
        const s = await api.status(jobId);
        setStatus(s);
        if (s.status === "succeeded") {
          nav(`/result/${jobId}`);
          return;
        }
        if (s.status === "failed" || s.status === "canceled") {
        } else {
          timer = setTimeout(tick, 2500);
        }
      } catch (e) {
        timer = setTimeout(tick, 3000);
      }
    }
    tick();
    return () => clearTimeout(timer);
  }, [jobId, nav]);

  const phase = status?.status ?? "loading";
  const isError = phase === "failed" || phase === "canceled" || phase === "cancelled";
  const steps = ["queued", "preprocessing", "running", "processing", "succeeded"];
  const currentIndex = steps.indexOf(phase);

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border bg-white shadow-sm p-5 space-y-3 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-xs text-gray-500">Job: {jobId}</div>
        <div className="text-xl font-semibold capitalize">{phase}</div>
        {status?.message ? <div className="text-gray-700 text-sm">{status.message}</div> : null}
        {status?.eta_seconds ? <div className="text-gray-600 text-sm">ETA: ~{status.eta_seconds}s</div> : null}

        {/* Progress visualization */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${i <= currentIndex ? "bg-blue-600" : "bg-gray-300"}`}></div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-10 sm:w-16 ${i < currentIndex ? "bg-blue-200" : "bg-gray-200"}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">Progress: {Math.max(0, Math.min(100, ((currentIndex + 1) / steps.length) * 100)).toFixed(0)}%</div>
        </div>

        {isError ? (
          <div className="pt-4 flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-gray-800 text-white" onClick={() => nav("/")}>Start Over</button>
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
              onClick={async () => {
                try {
                  const last = localStorage.getItem("lastRequest");
                  if (!last) throw new Error("No previous request found");
                  const payload = JSON.parse(last);
                  const newJob = await api.createVideo(payload);
                  addToast({ title: "Resubmitted", description: `New ID: ${newJob.job_id}`, type: "success" });
                  nav(`/status/${newJob.job_id}`);
                } catch (e: any) {
                  addToast({ title: "Resubmit failed", description: e.message ?? String(e), type: "error" });
                }
              }}
            >
              Resubmit Last Request
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(jobId || "");
                  addToast({ title: "Copied", description: "Job ID copied to clipboard", type: "success", duration: 1800 });
                } catch {
                  addToast({ title: "Copy failed", description: "Could not copy Job ID", type: "error" });
                }
              }}
            >
              Copy Job ID
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
