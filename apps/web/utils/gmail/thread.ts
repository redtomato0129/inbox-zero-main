import type { gmail_v1 } from "googleapis";
import { getBatch } from "@/utils/gmail/batch";

export async function getThread(threadId: string, gmail: gmail_v1.Gmail) {
  const thread = await gmail.users.threads.get({ userId: "me", id: threadId });
  return thread.data;
}

export async function getThreads(
  q: string,
  labelIds: string[],
  gmail: gmail_v1.Gmail,
  maxResults = 100,
) {
  const threads = await gmail.users.threads.list({
    userId: "me",
    q,
    labelIds,
    maxResults,
  });
  return threads.data;
}

export async function getThreadsBatch(
  threadIds: string[],
  accessToken: string,
): Promise<gmail_v1.Schema$Thread[]> {
  const batch = await getBatch(
    threadIds,
    "/gmail/v1/users/me/threads",
    accessToken,
  );

  return batch;
}

export async function getThreadsFromSenders(
  gmail: gmail_v1.Gmail,
  senders: string[],
) {
  if (!senders.length) return [];
  const query = senders.map((sender) => `(from:${sender})`).join(" OR ");
  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
  });

  return response.data.messages;
}
