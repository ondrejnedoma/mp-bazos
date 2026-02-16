const jobStatuses = new Map();
jobStatuses.set("extract-prices", { status: "idle" });
jobStatuses.set("update-catalogue", { status: "idle" });

export function getJobStatus(jobId) {
  return jobStatuses.get(jobId);
}

export function setJobStatus(jobId, status, error = null) {
  jobStatuses.set(jobId, { status, error, updatedAt: new Date() });
}

export function clearJobStatus(jobId) {
  jobStatuses.delete(jobId);
}
