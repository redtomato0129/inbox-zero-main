import { z } from "zod";
import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { sendStatsEmail } from "@inboxzero/resend";
import { withError } from "@/utils/middleware";
import { getWeeklyStats } from "@inboxzero/tinybird";
import { env } from "@/env";
import { hasCronSecret } from "@/utils/cron";
import { captureException } from "@/utils/error";
import prisma from "@/utils/prisma";
import { getGmailClient } from "@/utils/gmail/client";
import { loadTinybirdEmails } from "@/app/api/user/stats/tinybird/load/load-emails";

const sendWeeklyStatsBody = z.object({ email: z.string() });

async function sendWeeklyStats(options: { email: string }) {
  const { email } = options;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      accounts: { select: { access_token: true, refresh_token: true } },
    },
  });

  const account = user.accounts[0];
  const accessToken = account.access_token;
  const refreshToken = account.refresh_token;

  if (!accessToken) {
    captureException(
      new Error(`No access token for user ${email} when sending weekly stats`),
    );
    return { success: false };
  }

  const gmail = getGmailClient({
    accessToken,
    refreshToken: refreshToken ?? undefined,
  });

  await loadTinybirdEmails(
    {
      ownerEmail: email,
      accessToken,
      gmail,
    },
    {
      loadBefore: false,
    },
  );

  console.log("Updated tinybird stats");

  // fetch tinybird stats
  const cutOffDate = subDays(new Date(), 7).getTime();

  // const [newSenders, weeklyStats] = await Promise.all([
  //   getNewSenders({ ownerEmail: email, cutOffDate }),
  //   getWeeklyStats({ ownerEmail: email, cutOffDate }),
  // ]);
  const weeklyStats = await getWeeklyStats({ ownerEmail: email, cutOffDate });

  const weeklyTotals = weeklyStats.data[0];

  // skip if we don't have emails
  if (!weeklyTotals.totalEmails) return { success: true };

  const totalEmailsReceived =
    weeklyTotals.totalEmails - weeklyTotals.sentEmails;

  // const newSenderList = uniqBy(newSenders.data, (sender) => sender.from);

  // send email
  await sendStatsEmail({
    to: email,
    emailProps: {
      baseUrl: env.NEXT_PUBLIC_BASE_URL,
      // userEmail: email,
      received: totalEmailsReceived,
      receivedPercentageDifference: null, // TODO
      archived: weeklyTotals.archivedEmails,
      read: weeklyTotals.readEmails,
      archiveRate: (weeklyTotals.archivedEmails * 100) / totalEmailsReceived,
      readRate: (weeklyTotals.readEmails * 100) / totalEmailsReceived,
      sent: weeklyTotals.sentEmails,
      sentPercentageDifference: null, // TODO
      // newSenders: newSenderList,
    },
  });

  return { success: true };
}

export const POST = withError(async (request: Request) => {
  console.log("sending weekly stats to user");
  if (!hasCronSecret(request)) {
    captureException(new Error("Unauthorized cron request: resend"));
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const body = sendWeeklyStatsBody.parse(json);

  const result = await sendWeeklyStats(body);

  return NextResponse.json(result);
});
