import { NextResponse } from "next/server";
import { withError } from "@/utils/middleware";
import { ExecutedRuleStatus } from "@prisma/client";
import { getExecutedRules } from "@/app/api/user/planned/get-executed-rules";

export const dynamic = "force-dynamic";

export type PlanHistoryResponse = Awaited<ReturnType<typeof getExecutedRules>>;

export const GET = withError(async (request) => {
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1");
  const messages = await getExecutedRules(ExecutedRuleStatus.APPLIED, page);
  return NextResponse.json(messages);
});
