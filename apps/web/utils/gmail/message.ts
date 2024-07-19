import type { gmail_v1 } from "googleapis";
import { parseMessage } from "@/utils/mail";
import {
  type BatchError,
  type MessageWithPayload,
  type ParsedMessage,
  isBatchError,
  isDefined,
} from "@/utils/types";
import { getBatch } from "@/utils/gmail/batch";
import { extractDomainFromEmail } from "@/utils/email";

export async function getMessage(
  messageId: string,
  gmail: gmail_v1.Gmail,
  format?: "full",
): Promise<MessageWithPayload> {
  const message = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format,
  });

  return message.data as MessageWithPayload;
}

export async function getMessagesBatch(
  messageIds: string[],
  accessToken: string,
): Promise<ParsedMessage[]> {
  if (messageIds.length > 100) throw new Error("Too many messages. Max 1000");

  const batch: (MessageWithPayload | BatchError)[] = await getBatch(
    messageIds,
    "/gmail/v1/users/me/messages",
    accessToken,
  );

  const messages = batch
    .map((message) => {
      if (isBatchError(message)) {
        // TODO need a better way to handle this
        console.error(
          `Error fetching message ${message.error.code} ${message.error.message}`,
        );
        return;
      }

      return parseMessage(message as MessageWithPayload);
    })
    .filter(isDefined);

  return messages;
}

async function findPreviousEmailsBySender(
  gmail: gmail_v1.Gmail,
  options: {
    sender: string;
    dateInSeconds: number;
  },
) {
  const messages = await gmail.users.messages.list({
    userId: "me",
    q: `from:${options.sender} before:${options.dateInSeconds}`,
    maxResults: 2,
  });

  return messages.data.messages;
}

export async function hasPreviousEmailsFromSender(
  gmail: gmail_v1.Gmail,
  options: { from: string; date: string; threadId: string },
) {
  const previousEmails = await findPreviousEmailsBySender(gmail, {
    sender: options.from,
    dateInSeconds: +new Date(options.date) / 1000,
  });
  const hasPreviousEmail = !!previousEmails?.find(
    (p) => p.threadId !== options.threadId,
  );

  return hasPreviousEmail;
}

export async function hasPreviousEmailsFromDomain(
  gmail: gmail_v1.Gmail,
  options: { from: string; date: string; threadId: string },
) {
  const domain = extractDomainFromEmail(options.from);

  return hasPreviousEmailsFromSender(gmail, {
    ...options,
    from: domain || options.from,
  });
}

export async function getMessages(
  gmail: gmail_v1.Gmail,
  options: {
    query?: string;
    maxResults?: number;
    pageToken?: string;
  },
) {
  const messages = await gmail.users.messages.list({
    userId: "me",
    maxResults: options.maxResults,
    q: options.query,
    pageToken: options.pageToken,
  });

  return messages.data;
}

export async function queryBatchMessages(
  gmail: gmail_v1.Gmail,
  accessToken: string,
  {
    query,
    maxResults = 20,
    pageToken,
  }: {
    query?: string;
    maxResults?: number;
    pageToken?: string;
  },
) {
  if (maxResults > 20) {
    throw new Error(
      "Max results must be 20 or Google will rate limit us and return 429 errors.",
    );
  }

  const messages = await getMessages(gmail, { query, maxResults, pageToken });
  if (!messages.messages) return { messages: [], nextPageToken: undefined };
  const messageIds = messages.messages.map((m) => m.id).filter(isDefined);
  return {
    messages: (await getMessagesBatch(messageIds, accessToken)) || [],
    nextPageToken: messages.nextPageToken,
  };
}

// loops through multiple pages of messages
export async function queryBatchMessagesPages(
  gmail: gmail_v1.Gmail,
  accessToken: string,
  {
    query,
    maxResults,
  }: {
    query: string;
    maxResults: number;
  },
) {
  const messages: ParsedMessage[] = [];
  let nextPageToken: string | undefined;
  do {
    const { messages: pageMessages, nextPageToken: nextToken } =
      await queryBatchMessages(gmail, accessToken, {
        query,
        pageToken: nextPageToken,
      });
    messages.push(...pageMessages);
    nextPageToken = nextToken || undefined;
  } while (nextPageToken && messages.length < maxResults);

  return messages;
}
