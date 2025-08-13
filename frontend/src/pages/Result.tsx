import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, JobResult } from "../lib/api";
import { useToast } from "../components/ToastProvider";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";

export default function Result() {
  const { jobId } = useParams();
  const [res, setRes] = useState<JobResult | null>(null);
  const downloadUrl = jobId ? `${API_BASE}/api/videos/${jobId}/download` : undefined;
  const { addToast } = useToast();

  useEffect(() => {
    if (!jobId) return;
    api.result(jobId).then(setRes).catch((e)=>console.error(e));
  }, [jobId]);

  if (!res) return (
    <div className="max-w-3xl">
      <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-gray-200 dark:bg-slate-800" />
        <div className="h-9 w-40 bg-gray-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-xs text-gray-500">Job: {res.job_id}</div>
        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <video className="h-full w-full" controls src={res.file_url}></video>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="px-4 py-2 rounded-lg bg-blue-600 text-white" href={res.file_url} download>
            Download Direct
          </a>
          {downloadUrl ? (
            <a className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700" href={downloadUrl}>
              Download via Proxy
            </a>
          ) : null}
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(res.job_id);
                addToast({ title: "Copied", description: "Job ID copied to clipboard", type: "success", duration: 1800 });
              } catch {
                addToast({ title: "Copy failed", description: "Could not copy Job ID", type: "error" });
              }
            }}
          >
            Copy Job ID
          </button>
        </div>
      </div>
    </div>
  );
}
