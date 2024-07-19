import type { gmail_v1 } from "googleapis";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { extractEmailAddress } from "@/utils/email";
import { getGmailClient } from "@/utils/gmail/client";
import { getFiltersList } from "@/utils/gmail/filter";
import prisma from "@/utils/prisma";
import { NewsletterStatus } from "@prisma/client";
import { INBOX_LABEL_ID, TRASH_LABEL_ID } from "@/utils/gmail/label";

export async function getAutoArchiveFilters() {
  const session = await auth();
  if (!session?.user.email) throw new Error("Not logged in");
  const gmail = getGmailClient(session);

  const filters = await getFiltersList({ gmail });
  const autoArchiveFilters = filters.data.filter?.filter((filter) => {
    return (
      filter.action?.removeLabelIds?.includes(INBOX_LABEL_ID) ||
      filter.action?.addLabelIds?.includes(TRASH_LABEL_ID)
    );
  });

  return autoArchiveFilters || [];
}

export function findAutoArchiveFilter(
  autoArchiveFilters: gmail_v1.Schema$Filter[],
  fromEmail: string,
) {
  return autoArchiveFilters.find((filter) => {
    const from = extractEmailAddress(fromEmail);
    return filter.criteria?.from?.includes(from);
  });
}

export async function findNewsletterStatus(userId: string) {
  const userNewsletters = await prisma.newsletter.findMany({
    where: { userId },
    select: { email: true, status: true },
  });
  return userNewsletters;
}

export function filterNewsletters<
  T extends {
    autoArchived?: gmail_v1.Schema$Filter;
    status?: NewsletterStatus | null;
  },
>(
  newsletters: T[],
  filters: ("unhandled" | "autoArchived" | "unsubscribed" | "approved" | "")[],
): T[] {
  const showAutoArchived = filters.includes("autoArchived");
  const showApproved = filters.includes("approved");
  const showUnsubscribed = filters.includes("unsubscribed");
  const showUnhandled = filters.includes("unhandled");

  return newsletters.filter((email) => {
    if (
      showAutoArchived &&
      (email.autoArchived || email.status === NewsletterStatus.AUTO_ARCHIVED)
    )
      return true;
    if (showUnsubscribed && email.status === NewsletterStatus.UNSUBSCRIBED)
      return true;
    if (showApproved && email.status === NewsletterStatus.APPROVED) return true;
    if (showUnhandled && !email.status && !email.autoArchived) return true;

    return false;
  });
}
