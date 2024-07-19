import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { withError } from "@/utils/middleware";

export type GroupRulesResponse = Awaited<ReturnType<typeof getGroupRules>>;

async function getGroupRules({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) {
  const groupWithRules = await prisma.group.findUniqueOrThrow({
    where: { id: groupId, userId },
    select: {
      rule: {
        include: {
          actions: true,
        },
      },
    },
  });
  return { rule: groupWithRules.rule };
}

export const GET = withError(async (_request: Request, { params }) => {
  const session = await auth();
  if (!session?.user.email)
    return NextResponse.json({ error: "Not authenticated" });

  if (!params.groupId) return NextResponse.json({ error: "Group id required" });

  const result = await getGroupRules({
    userId: session.user.id,
    groupId: params.groupId,
  });

  return NextResponse.json(result);
});
