import { dataMode } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (dataMode !== "live") {
    return Response.json({ error: "Sync is disabled in demo mode." }, { status: 409 });
  }

  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { syncTrends } = await import("@/lib/sync");
    return Response.json({ report: await syncTrends() });
  } catch (error) {
    console.error("Trend synchronization failed.", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Trend synchronization failed. Check server logs and database/provider configuration." }, { status: 500 });
  }
}
