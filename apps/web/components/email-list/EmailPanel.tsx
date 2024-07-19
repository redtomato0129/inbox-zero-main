import { type SyntheticEvent, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useAtomValue } from "jotai";
import { DownloadIcon, ForwardIcon, ReplyIcon, XIcon } from "lucide-react";
import { ActionButtons } from "@/components/ActionButtons";
import { Tooltip } from "@/components/Tooltip";
import type { Thread } from "@/components/email-list/types";
import { extractNameFromEmail } from "@/utils/email";
import { formatShortDate } from "@/utils/date";
import { ComposeEmailFormLazy } from "@/app/(app)/compose/ComposeEmailFormLazy";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createInAiQueueSelector } from "@/store/queue";
import { Card } from "@/components/Card";
import { PlanExplanation } from "@/components/email-list/PlanExplanation";
import { ParsedMessage } from "@/utils/types";

export function EmailPanel(props: {
  row: Thread;
  isCategorizing: boolean;
  onPlanAiAction: (thread: Thread) => void;
  onAiCategorize: (thread: Thread) => void;
  onArchive: (thread: Thread) => void;
  close: () => void;

  executingPlan: boolean;
  rejectingPlan: boolean;
  executePlan: (thread: Thread) => Promise<void>;
  rejectPlan: (thread: Thread) => Promise<void>;
  refetch: () => void;
}) {
  const inAiQueueSelector = useMemo(
    () => createInAiQueueSelector(props.row.id),
    [props.row.id],
  );
  const isPlanning = useAtomValue(inAiQueueSelector);

  const lastMessage = props.row.messages?.[props.row.messages.length - 1];

  const plan = props.row.plan;

  return (
    <div className="flex h-full flex-col overflow-y-hidden border-l border-l-gray-100">
      <div className="sticky border-b border-b-gray-100 p-4 md:flex md:items-center md:justify-between">
        <div className="md:w-0 md:flex-1">
          <h1
            id="message-heading"
            className="text-lg font-medium text-gray-900"
          >
            {lastMessage.headers.subject}
          </h1>
          <p className="mt-1 truncate text-sm text-gray-500">
            {lastMessage.headers.from}
          </p>
        </div>

        <div className="mt-3 flex items-center md:ml-2 md:mt-0">
          <ActionButtons
            threadId={props.row.id!}
            isPlanning={isPlanning}
            isCategorizing={props.isCategorizing}
            onPlanAiAction={() => props.onPlanAiAction(props.row)}
            onAiCategorize={() => props.onAiCategorize(props.row)}
            onArchive={() => {
              props.onArchive(props.row);
              props.close();
            }}
            refetch={props.refetch}
          />
          <Tooltip content="Close">
            <Button onClick={props.close} size="icon" variant="ghost">
              <span className="sr-only">Close</span>
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        {plan?.rule && (
          <PlanExplanation
            thread={props.row}
            executePlan={props.executePlan}
            rejectPlan={props.rejectPlan}
            executingPlan={props.executingPlan}
            rejectingPlan={props.rejectingPlan}
          />
        )}
        <EmailThread messages={props.row.messages} refetch={props.refetch} />
      </div>
    </div>
  );
}

function EmailThread(props: {
  messages: Thread["messages"];
  refetch: () => void;
}) {
  return (
    <div className="grid flex-1 gap-4 overflow-auto bg-gray-100 p-4">
      <ul role="list" className="space-y-2 sm:space-y-4">
        {props.messages?.map((message) => (
          <EmailMessage
            key={message.id}
            message={message}
            refetch={props.refetch}
          />
        ))}
      </ul>
    </div>
  );
}

function EmailMessage(props: {
  message: Thread["messages"][0];
  refetch: () => void;
}) {
  const { message } = props;

  const [showReply, setShowReply] = useState(false);
  const onReply = useCallback(() => setShowReply(true), []);
  const [showForward, setShowForward] = useState(false);
  const onForward = useCallback(() => setShowForward(true), []);

  const onCloseCompose = useCallback(() => {
    setShowReply(false);
    setShowForward(false);
  }, []);

  const prepareReplyingToEmail = (message: ParsedMessage) => ({
    to: message.headers.from,
    subject: `Re: ${message.headers.subject}`,
    headerMessageId: message.headers["message-id"]!,
    threadId: message.threadId!,
    cc: message.headers.cc,
    references: message.headers.references,
    messageText: "",
    messageHtml: "",
  });

  const prepareForwardingEmail = (message: ParsedMessage) => ({
    to: "",
    subject: `Fwd: ${message.headers.subject}`,
    headerMessageId: "",
    threadId: message.threadId!,
    cc: "",
    references: "",
    messageText: `
      \n\n--- Forwarded message ---
      \nFrom: ${message.headers.from}
      \nDate: ${message.headers.date}
      \nSubject: ${message.headers.subject}
      \nTo: ${message.headers.to}
      ${message.textPlain}
    `,
    messageHtml: `
      <br><br>
      <div style="border-left: 2px solid #ccc; padding-left: 10px; margin: 10px 0;">
        <p><strong>--- Forwarded message ---</strong></p>
        <p><strong>From:</strong> ${message.headers.from}</p>
        <p><strong>Date:</strong> ${message.headers.date}</p>
        <p><strong>Subject:</strong> ${message.headers.subject}</p>
        <p><strong>To:</strong> ${message.headers.to}</p>
      </div>
      ${message.textHtml}
    `,
  });

  return (
    <li className="bg-white p-4 shadow sm:rounded-lg">
      <div className="sm:flex sm:items-baseline sm:justify-between">
        <h3 className="text-base font-medium">
          <span className="text-gray-900">
            {extractNameFromEmail(message.headers.from)}
          </span>{" "}
          <span className="text-gray-600">wrote</span>
        </h3>

        <div className="flex items-center space-x-2">
          <p className="mt-1 whitespace-nowrap text-sm text-gray-600 sm:ml-3 sm:mt-0">
            <time dateTime={message.headers.date}>
              {formatShortDate(new Date(message.headers.date))}
            </time>
          </p>
          <div className="flex items-center">
            <Tooltip content="Reply">
              <Button variant="ghost" size="icon" onClick={onReply}>
                <ReplyIcon className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </Tooltip>
            <Tooltip content="Forward">
              <Button variant="ghost" size="icon">
                <ForwardIcon className="h-4 w-4" onClick={onForward} />
                <span className="sr-only">Forward</span>
              </Button>
            </Tooltip>

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Delete this message</DropdownMenuItem>
                <DropdownMenuItem>Report spam</DropdownMenuItem>
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Open in Gmail</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>
      </div>
      <div className="mt-4">
        {message.textHtml ? (
          <HtmlEmail html={message.textHtml} />
        ) : (
          <PlainEmail text={message.textPlain || ""} />
        )}
      </div>
      {message.attachments && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {message.attachments.map((attachment) => {
            const url = `/api/google/messages/attachment?messageId=${message.id}&attachmentId=${attachment.attachmentId}&mimeType=${attachment.mimeType}&filename=${attachment.filename}`;

            return (
              <Card key={attachment.filename}>
                <div className="text-gray-600">{attachment.filename}</div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-gray-600">
                    {mimeTypeToString(attachment.mimeType)}
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={url} target="_blank">
                      <>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </>
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(showReply || showForward) && (
        <>
          <Separator className="my-4" />

          <div className="">
            <ComposeEmailFormLazy
              replyingToEmail={
                showReply
                  ? prepareReplyingToEmail(message)
                  : prepareForwardingEmail(message)
              }
              novelEditorClassName="h-40 overflow-auto"
              refetch={props.refetch}
              onSuccess={onCloseCompose}
              onDiscard={onCloseCompose}
            />
          </div>
        </>
      )}
    </li>
  );
}

export function HtmlEmail(props: { html: string }) {
  const srcDoc = useMemo(() => getIframeHtml(props.html), [props.html]);

  const onLoad = useCallback(
    (event: SyntheticEvent<HTMLIFrameElement, Event>) => {
      if (event.currentTarget.contentWindow) {
        // sometimes we see minimal scrollbar, so add a buffer
        const BUFFER = 5;

        event.currentTarget.style.height =
          event.currentTarget.contentWindow.document.documentElement
            .scrollHeight +
          BUFFER +
          "px";
      }
    },
    [],
  );

  return <iframe srcDoc={srcDoc} onLoad={onLoad} className="h-full w-full" />;
}

function PlainEmail(props: { text: string }) {
  return <pre className="whitespace-pre-wrap">{props.text}</pre>;
}

function getIframeHtml(html: string) {
  let htmlWithFontFamily = "";
  // Set font to sans-serif if font not set
  if (html.indexOf("font-family") === -1) {
    htmlWithFontFamily = `<style>* { font-family: sans-serif; }</style>${html}`;
  } else {
    htmlWithFontFamily = html;
  }

  let htmlWithHead = "";

  // Open all links in a new tab
  if (htmlWithFontFamily.indexOf("</head>") === -1) {
    htmlWithHead = `<head><base target="_blank"></head>${htmlWithFontFamily}`;
  } else {
    htmlWithHead = htmlWithFontFamily.replace(
      "</head>",
      `<base target="_blank"></head>`,
    );
  }

  return htmlWithHead;
}

function mimeTypeToString(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "PDF";
    case "application/zip":
      return "ZIP";
    case "image/png":
      return "PNG";
    case "image/jpeg":
      return "JPEG";
    // LLM generated. Need to check they're actually needed
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "DOCX";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "XLSX";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "PPTX";
    case "application/vnd.ms-excel":
      return "XLS";
    case "application/vnd.ms-powerpoint":
      return "PPT";
    case "application/vnd.ms-word":
      return "DOC";
    default:
      return mimeType;
  }
}
