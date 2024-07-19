import { NextResponse } from "next/server";
import { withError } from "@/utils/middleware";
import { env } from "@/env";
import { processHistoryForUser } from "@/app/api/google/webhook/process-history";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Google PubSub calls this endpoint each time a user recieves an email. We subscribe for updates via `api/google/watch`
export const POST = withError(async (request: Request) => {
  const searchParams = new URL(request.url).searchParams;
  const token = searchParams.get("token");
  if (
    env.GOOGLE_PUBSUB_VERIFICATION_TOKEN &&
    token !== env.GOOGLE_PUBSUB_VERIFICATION_TOKEN
  ) {
    console.error("Invalid verification token");
    return NextResponse.json(
      {
        message: "Invalid verification token",
      },
      { status: 403 },
    );
  }

  const body = await request.json();
  const decodedData = decodeHistoryId(body);

  console.log("Webhook. Processing:", decodedData);

  return await processHistoryForUser(decodedData);
});

function decodeHistoryId(body: any) {
  const data = body.message.data;

  // data is base64url-encoded JSON
  const decodedData: { emailAddress: string; historyId: number | string } =
    JSON.parse(
      Buffer.from(data, "base64")
        .toString()
        .replace(/-/g, "+")
        .replace(/_/g, "/"),
    );

  // seem to get this in different formats? so unifying as number
  const historyId =
    typeof decodedData.historyId === "string"
      ? Number.parseInt(decodedData.historyId)
      : decodedData.historyId;

  return { emailAddress: decodedData.emailAddress, historyId };
}
