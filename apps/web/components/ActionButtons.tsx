import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArchiveIcon,
  Trash2Icon,
  ExternalLinkIcon,
  OrbitIcon,
  SparklesIcon,
} from "lucide-react";
import { ButtonGroup } from "@/components/ButtonGroup";
import { LoadingMiniSpinner } from "@/components/Loading";
import { getGmailUrl } from "@/utils/url";
import { onTrashThread } from "@/utils/actions/client";

export function ActionButtons(props: {
  threadId: string;
  isPlanning: boolean;
  isCategorizing: boolean;
  shadow?: boolean;
  onPlanAiAction: () => void;
  onAiCategorize: () => void;
  onArchive: () => void;
  refetch: () => void;
}) {
  const session = useSession();
  const email = session.data?.user.email;

  const {
    threadId,
    onArchive,
    onPlanAiAction,
    onAiCategorize,
    isCategorizing,
    isPlanning,
    refetch,
  } = props;

  const openInGmail = useCallback(() => {
    // open in gmail
    const url = getGmailUrl(threadId, email);
    window.open(url, "_blank");
  }, [threadId, email]);

  const [isTrashing, setIsTrashing] = useState(false);

  // TODO lift this up to the parent component to be consistent / to support bulk trash
  // TODO show loading toast
  const onTrash = useCallback(async () => {
    setIsTrashing(true);
    await onTrashThread(threadId);
    refetch();
    setIsTrashing(false);
  }, [threadId, refetch]);

  const buttons = useMemo(
    () => [
      {
        tooltip: "Open in Gmail",
        onClick: openInGmail,
        icon: (
          <ExternalLinkIcon
            className="h-4 w-4 text-gray-700"
            aria-hidden="true"
          />
        ),
      },
      {
        tooltip: "Run AI Rules",
        onClick: onPlanAiAction,
        icon: isPlanning ? (
          <LoadingMiniSpinner />
        ) : (
          <SparklesIcon className="h-4 w-4 text-gray-700" aria-hidden="true" />
        ),
      },
      {
        tooltip: "AI Categorize",
        onClick: onAiCategorize,
        icon: isCategorizing ? (
          <LoadingMiniSpinner />
        ) : (
          <OrbitIcon className="h-4 w-4 text-gray-700" aria-hidden="true" />
        ),
      },
      {
        tooltip: "Archive",
        onClick: onArchive,
        icon: (
          <ArchiveIcon className="h-4 w-4 text-gray-700" aria-hidden="true" />
        ),
      },
      // may remove later
      {
        tooltip: "Delete",
        onClick: onTrash,
        icon: isTrashing ? (
          <LoadingMiniSpinner />
        ) : (
          <Trash2Icon className="h-4 w-4 text-gray-700" aria-hidden="true" />
        ),
      },
    ],
    [
      onTrash,
      isTrashing,
      onArchive,
      onPlanAiAction,
      isPlanning,
      onAiCategorize,
      isCategorizing,
      openInGmail,
    ],
  );

  return <ButtonGroup buttons={buttons} shadow={props.shadow} />;
}
