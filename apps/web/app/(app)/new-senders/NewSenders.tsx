"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import groupBy from "lodash/groupBy";
import { FilterIcon, Users2Icon } from "lucide-react";
import { LoadingContent } from "@/components/LoadingContent";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpanded } from "@/app/(app)/stats/useExpanded";
import { NewsletterModal } from "@/app/(app)/stats/NewsletterModal";
import type {
  NewSendersQuery,
  NewSendersResponse,
} from "@/app/api/user/stats/new-senders/route";
import { formatShortDate } from "@/utils/date";
import { formatStat } from "@/utils/stats";
import { StatsCards } from "@/components/StatsCards";
import {
  useNewsletterFilter,
  useBulkUnsubscribeShortcuts,
  ActionCell,
  HeaderButton,
} from "@/app/(app)/bulk-unsubscribe/common";
import { DetailedStatsFilter } from "@/app/(app)/stats/DetailedStatsFilter";
import type { LabelsResponse } from "@/app/api/google/labels/route";
import { usePremium } from "@/components/PremiumAlert";
import type { DateRange } from "react-day-picker";
import { usePremiumModal } from "@/app/(app)/premium/PremiumModal";
import { useLabels } from "@/hooks/useLabels";
import { ShortcutTooltip } from "@/app/(app)/bulk-unsubscribe/ShortcutTooltip";
import { Row } from "@/app/(app)/bulk-unsubscribe/types";
import { SectionHeader } from "@/app/(app)/bulk-unsubscribe/SectionHeader";

export function NewSenders(props: {
  dateRange?: DateRange | undefined;
  refreshInterval: number;
}) {
  const session = useSession();
  const userEmail = session.data?.user.email || "";

  const [sortColumn, setSortColumn] = useState<
    "subject" | "date" | "numberOfEmails"
  >("numberOfEmails");

  // const { typesArray, types, setTypes } = useEmailsToIncludeFilter();
  const { filtersArray, filters, setFilters } = useNewsletterFilter();

  const params: NewSendersQuery = { cutOffDate: 0, filters: filtersArray };
  const urlParams = new URLSearchParams(params as any);
  const { data, isLoading, error, mutate } = useSWR<
    NewSendersResponse,
    { error: string }
  >(`/api/user/stats/new-senders?${urlParams}`, {
    keepPreviousData: true,
  });

  const groupedSenders = groupBy(data?.emails, (email) => email.fromDomain);
  const newSenders = Object.entries(groupedSenders);

  const { hasUnsubscribeAccess, mutate: refetchPremium } = usePremium();
  const { userLabels } = useLabels();

  const { expanded, extra } = useExpanded();
  const [openedNewsletter, setOpenedNewsletter] = React.useState<Row>();

  const [selectedRow, setSelectedRow] = React.useState<Row | undefined>();

  const rows: (Row & {
    firstEmail: {
      from: string;
      subject: string;
      timestamp: number;
    };
    numberOfEmails: number;
  })[] = newSenders.map(([_, emails]) => {
    const firstEmail = emails[0];
    return {
      ...firstEmail,
      firstEmail,
      numberOfEmails: emails.length,
    };
  });

  useBulkUnsubscribeShortcuts({
    newsletters: rows,
    selectedRow,
    setOpenedNewsletter,
    setSelectedRow,
    refetchPremium,
    hasUnsubscribeAccess,
    mutate,
  });

  const { openModal, PremiumModal } = usePremiumModal();

  return (
    <>
      <LoadingContent
        loading={!data && isLoading}
        error={error}
        loadingComponent={<Skeleton className="h-24 rounded" />}
      >
        <StatsCards
          stats={[
            {
              name: "New senders this week",
              value: formatStat(newSenders.length),
              subvalue: "senders",
              icon: <Users2Icon className="h-4 w-4" />,
            },
          ]}
        />
      </LoadingContent>
      <Card className="mt-2 sm:mt-4">
        <div className="items-center justify-between px-6 pt-6 md:flex">
          <SectionHeader
            title="Who are the first time senders?"
            description="A list of emails that you received for the first time."
          />
          <div className="ml-4 mt-3 flex justify-end space-x-2 md:mt-0">
            <div className="hidden md:block">
              <ShortcutTooltip />
            </div>

            <DetailedStatsFilter
              label="Filter"
              icon={<FilterIcon className="mr-2 h-4 w-4" />}
              keepOpenOnSelect
              columns={[
                {
                  label: "Unhandled",
                  checked: filters.unhandled,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      ["unhandled"]: !filters.unhandled,
                    }),
                },
                {
                  label: "Auto Archived",
                  checked: filters.autoArchived,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      ["autoArchived"]: !filters.autoArchived,
                    }),
                },
                {
                  label: "Unsubscribed",
                  checked: filters.unsubscribed,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      ["unsubscribed"]: !filters.unsubscribed,
                    }),
                },
                {
                  label: "Approved",
                  checked: filters.approved,
                  setChecked: () =>
                    setFilters({ ...filters, ["approved"]: !filters.approved }),
                },
              ]}
            />

            {/* <EmailsToIncludeFilter types={types} setTypes={setTypes} /> */}
          </div>
        </div>

        <LoadingContent
          loading={!data && isLoading}
          error={error}
          loadingComponent={<Skeleton className="m-4 h-screen rounded" />}
        >
          {newSenders && (
            <NewSendersTable
              sortColumn={sortColumn}
              setSortColumn={setSortColumn}
              tableRows={rows
                .slice(0, expanded ? undefined : 50)
                .map((item) => {
                  return (
                    <NewSenderRow
                      key={item.name}
                      item={item}
                      userEmail={userEmail}
                      firstEmail={item.firstEmail}
                      numberOfEmails={item.numberOfEmails}
                      setOpenedNewsletter={setOpenedNewsletter}
                      userGmailLabels={userLabels}
                      mutate={mutate}
                      selected={selectedRow?.name === item.name}
                      onSelectRow={() => {
                        setSelectedRow(item);
                      }}
                      hasUnsubscribeAccess={hasUnsubscribeAccess}
                      refetchPremium={refetchPremium}
                      openPremiumModal={openModal}
                    />
                  );
                })}
            />
          )}
          <div className="mt-2 px-6 pb-6">{extra}</div>
        </LoadingContent>
      </Card>
      <NewsletterModal
        newsletter={openedNewsletter}
        onClose={() => setOpenedNewsletter(undefined)}
        refreshInterval={props.refreshInterval}
      />
      <PremiumModal />
    </>
  );
}

function NewSendersTable(props: {
  tableRows?: React.ReactNode;
  sortColumn: "subject" | "date" | "numberOfEmails";
  setSortColumn: (sortColumn: "subject" | "date" | "numberOfEmails") => void;
}) {
  const { tableRows, sortColumn, setSortColumn } = props;

  return (
    <Table className="mt-4">
      <TableHead>
        <TableRow>
          <TableHeaderCell className="pl-6">
            <span className="text-sm font-medium">From</span>
          </TableHeaderCell>
          <TableHeaderCell>
            <HeaderButton
              sorted={sortColumn === "subject"}
              onClick={() => setSortColumn("subject")}
            >
              Subject
            </HeaderButton>
          </TableHeaderCell>
          <TableHeaderCell>
            <HeaderButton
              sorted={sortColumn === "date"}
              onClick={() => setSortColumn("date")}
            >
              Date
            </HeaderButton>
          </TableHeaderCell>
          <TableHeaderCell>
            <HeaderButton
              sorted={sortColumn === "numberOfEmails"}
              onClick={() => setSortColumn("numberOfEmails")}
            >
              Emails
            </HeaderButton>
          </TableHeaderCell>
          <TableHeaderCell />
        </TableRow>
      </TableHead>
      <TableBody>{tableRows}</TableBody>
    </Table>
  );
}

function NewSenderRow(props: {
  item: Row;
  firstEmail: { from: string; subject: string; timestamp: number };
  userEmail: string;
  numberOfEmails: number;
  setOpenedNewsletter: React.Dispatch<React.SetStateAction<Row | undefined>>;
  userGmailLabels: LabelsResponse["labels"];
  mutate: () => Promise<any>;
  selected: boolean;
  onSelectRow: () => void;
  hasUnsubscribeAccess: boolean;
  refetchPremium: () => Promise<any>;
  openPremiumModal: () => void;
}) {
  const { item, firstEmail, numberOfEmails, refetchPremium, openPremiumModal } =
    props;

  return (
    <TableRow
      key={item.name}
      className={props.selected ? "bg-blue-50" : undefined}
      aria-selected={props.selected || undefined}
      data-selected={props.selected || undefined}
      onMouseEnter={props.onSelectRow}
    >
      <TableCell className="max-w-[200px] truncate pl-6 lg:max-w-[300px]">
        {firstEmail.from}
      </TableCell>
      <TableCell className="max-w-[300px] truncate lg:max-w-[400px]">
        {firstEmail.subject}
      </TableCell>
      <TableCell>{formatShortDate(new Date(firstEmail.timestamp))}</TableCell>
      <TableCell className="text-center">{numberOfEmails}</TableCell>
      <TableCell className="flex justify-end gap-2 p-2">
        <ActionCell
          item={item}
          userEmail={props.userEmail}
          hasUnsubscribeAccess={props.hasUnsubscribeAccess}
          mutate={props.mutate}
          refetchPremium={refetchPremium}
          setOpenedNewsletter={props.setOpenedNewsletter}
          selected={props.selected}
          userGmailLabels={props.userGmailLabels}
          openPremiumModal={openPremiumModal}
        />
      </TableCell>
    </TableRow>
  );
}
