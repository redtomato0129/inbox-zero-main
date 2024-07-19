"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { LoadingContent } from "@/components/LoadingContent";
import type { PendingExecutedRules } from "@/app/api/user/planned/route";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button, ButtonLoader } from "@/components/ui/button";
import { AlertBasic } from "@/components/Alert";
import { approvePlanAction, rejectPlanAction } from "@/utils/actions/ai-rule";
import { toastError } from "@/components/Toast";
import type { ParsedMessage } from "@/utils/types";
import {
  ActionItemsCell,
  EmailCell,
  RuleCell,
  TablePagination,
  // DateCell,
} from "@/app/(app)/automation/ExecutedRulesTable";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/Checkbox";
import { Loader2Icon } from "lucide-react";
import { useToggleSelect } from "@/hooks/useToggleSelect";
import { isActionError } from "@/utils/error";

export function Pending() {
  const searchParams = useSearchParams();
  const page = Number.parseInt(searchParams.get("page") || "1");
  const { data, isLoading, error, mutate } = useSWR<PendingExecutedRules>(
    `/api/user/planned?page=${page}`,
  );

  const session = useSession();

  return (
    <Card>
      <LoadingContent loading={isLoading} error={error}>
        {data?.executedRules.length ? (
          <PendingTable
            pending={data.executedRules}
            totalPages={data.totalPages}
            userEmail={session.data?.user.email || ""}
            mutate={mutate}
          />
        ) : (
          <AlertBasic
            title="No pending actions"
            description="Set automations for our AI to handle incoming emails for you."
          />
        )}
      </LoadingContent>
    </Card>
  );
}

function PendingTable({
  pending,
  totalPages,
  userEmail,
  mutate,
}: {
  pending: PendingExecutedRules["executedRules"];
  totalPages: number;
  userEmail: string;
  mutate: () => void;
}) {
  const { selected, isAllSelected, onToggleSelect, onToggleSelectAll } =
    useToggleSelect(pending);

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const approveSelected = useCallback(async () => {
    setIsApproving(true);
    for (const id of Array.from(selected.keys())) {
      const p = pending.find((p) => p.id === id);
      if (!p) continue;
      const result = await approvePlanAction(id, p.message);
      if (isActionError(result)) {
        toastError({
          description: "Unable to execute plan. " + result.error || "",
        });
      }
      mutate();
    }
    setIsApproving(false);
  }, [selected, pending, mutate]);
  const rejectSelected = useCallback(async () => {
    setIsRejecting(true);
    for (const id of Array.from(selected.keys())) {
      const p = pending.find((p) => p.id === id);
      if (!p) continue;
      const result = await rejectPlanAction(id);
      if (isActionError(result)) {
        toastError({
          description: "Error rejecting action. " + result.error || "",
        });
      }
      mutate();
    }
    setIsRejecting(false);
  }, [selected, pending, mutate]);

  return (
    <div>
      {Array.from(selected.values()).filter(Boolean).length > 0 && (
        <div className="m-2 flex items-center space-x-1.5">
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={approveSelected}
              disabled={isApproving || isRejecting}
            >
              {isApproving && <ButtonLoader />}
              Approve
            </Button>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={rejectSelected}
              disabled={isApproving || isRejecting}
            >
              {isRejecting && <ButtonLoader />}
              Reject
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox checked={isAllSelected} onChange={onToggleSelectAll} />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rule</TableHead>
            <TableHead>Action items</TableHead>
            <TableHead />
            {/* <TableHead /> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pending.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                {(isApproving || isRejecting) && selected.get(p.id) ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <Checkbox
                    checked={selected.get(p.id) || false}
                    onChange={() => onToggleSelect(p.id)}
                  />
                )}
              </TableCell>
              <TableCell>
                <EmailCell
                  from={p.message.headers.from}
                  subject={p.message.headers.subject}
                  snippet={p.message.snippet}
                  messageId={p.message.id}
                  userEmail={userEmail}
                />
              </TableCell>
              <TableCell>
                <RuleCell rule={p.rule} reason={p.reason} />
              </TableCell>
              <TableCell>
                <ActionItemsCell actionItems={p.actionItems} />
              </TableCell>
              <TableCell>
                <ExecuteButtons id={p.id} message={p.message} mutate={mutate} />
              </TableCell>
              {/* <TableCell>
              <DateCell createdAt={p.createdAt} />
            </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination totalPages={totalPages} />
    </div>
  );
}

function ExecuteButtons({
  id,
  message,
  mutate,
}: {
  id: string;
  message: ParsedMessage;
  mutate: () => void;
}) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  return (
    <div className="flex items-center justify-end space-x-2 font-medium">
      <Button
        variant="default"
        onClick={async () => {
          setIsApproving(true);
          const result = await approvePlanAction(id, message);
          if (isActionError(result)) {
            toastError({
              description: "Error approving action. " + result.error || "",
            });
          }
          mutate();

          setIsApproving(false);
        }}
        disabled={isApproving || isRejecting}
      >
        {isApproving && <ButtonLoader />}
        Approve
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          setIsRejecting(true);
          const result = await rejectPlanAction(id);
          if (isActionError(result)) {
            toastError({
              description: "Error rejecting action. " + result.error || "",
            });
          }
          mutate();
          setIsRejecting(false);
        }}
        disabled={isApproving || isRejecting}
      >
        {isRejecting && <ButtonLoader />}
        Reject
      </Button>
    </div>
  );
}
