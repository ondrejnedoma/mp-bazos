import { getJobStatus } from "@/helpers/jobStatusManager";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return Response.json({ error: "Missing jobId parameter" }, { status: 400 });
  }
  const status = getJobStatus(jobId);
  return Response.json(status);
}
