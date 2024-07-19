// Run with: `npx tsx scripts/deleteTinybirdDataForFreeUsers.ts`
// This script deletes all Tinybird data for users who are on the free plan.

import { PrismaClient } from "@prisma/client";
import { deleteTinybirdEmails } from "@inboxzero/tinybird";
import { sleep } from "@/utils/sleep";

const prisma = new PrismaClient();

const THIRTY_DAYS_AGO = new Date(
  new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
);

async function main() {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              premium: {
                lemonSqueezyRenewsAt: null,
              },
            },
            {
              premium: {
                lemonSqueezyRenewsAt: { lt: new Date() },
              },
            },
          ],
        },
        {
          OR: [
            {
              lastLogin: { lt: THIRTY_DAYS_AGO },
            },
            {
              lastLogin: null,
            },
          ],
        },
      ],
    },
    select: { email: true },
    orderBy: { createdAt: "asc" },
    // skip: 0,
  });
  console.log(`Deleting Tinybird data for ${users.length} users.`);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`Deleting data for index ${i}. Email: ${user.email}`);

    if (!user.email) {
      console.warn(`No email for user: ${user.email}`);
      continue;
    }

    try {
      await deleteTinybirdEmails({ email: user.email });
      await sleep(4_000);
    } catch (error: any) {
      console.error(error);
      console.error(Object.keys(error));

      await sleep(10_000);
    }
  }

  console.log(`Completed deleting Tinybird data for ${users.length} users.`);
}

main().finally(() => {
  prisma.$disconnect();
});
