import { LabelsResponse } from "@/app/api/google/labels/route";
import { NewsletterStatsResponse } from "@/app/api/user/stats/newsletters/route";
import { NewsletterStatus } from "@prisma/client";

export type Row = {
  name: string;
  lastUnsubscribeLink?: string | null;
  status?: NewsletterStatus | null;
  autoArchived?: { id?: string | null };
};

type Newsletter = NewsletterStatsResponse["newsletters"][number];

export interface RowProps {
  item: Newsletter;
  setOpenedNewsletter: React.Dispatch<
    React.SetStateAction<Newsletter | undefined>
  >;
  userGmailLabels: LabelsResponse["labels"];
  userEmail: string;
  mutate: () => Promise<any>;
  selected: boolean;
  onSelectRow: () => void;
  onDoubleClick: () => void;
  hasUnsubscribeAccess: boolean;
  refetchPremium: () => Promise<any>;
  openPremiumModal: () => void;
}
