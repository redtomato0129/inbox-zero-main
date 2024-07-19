import { env } from "@/env";

export const AI_GENERATED_FIELD_VALUE = "___AI_GENERATE___";

// This will be a user setting in the future
export const generalPrompt = `
I am the CEO of OpenAI. OpenAI is a research laboratory whose mission to ensure that artificial general intelligence benefits all of humanity.

Rules to follow:
* Be friendly, concise, and professional, but not overly formal.
* Draft responses of 1-3 sentences when necessary.
* Add the newsletter label to emails that are newsletters.
* Draft responses to snoozed emails that I haven't received a response to yet.
`;

export const appHomePath = env.NEXT_PUBLIC_DISABLE_TINYBIRD
  ? "/automation"
  : "/bulk-unsubscribe";
