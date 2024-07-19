import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { getGmailClient } from "@/utils/gmail/client";
import { parseMessage } from "@/utils/mail";
import { getMessage } from "@/utils/gmail/message";
import { withError } from "@/utils/middleware";

export type MessagesResponse = Awaited<ReturnType<typeof getMessages>>;

async function getMessages() {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const gmail = getGmailClient(session);

  const messages = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
    q: "-from:me",
  });

  const fullMessages = await Promise.all(
    (messages.data.messages || []).map(async (m) => {
      const message = await getMessage(m.id!, gmail);
      return parseMessage(message);
    }),
  );

  return { messages: fullMessages };
}

export const GET = withError(async () => {
  const result = await getMessages();

  return NextResponse.json(result);
});
