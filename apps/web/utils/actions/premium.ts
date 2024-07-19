"use server";

import uniq from "lodash/uniq";
import { withServerActionInstrumentation } from "@sentry/nextjs";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { env } from "@/env";
import { isAdminForPremium, isOnHigherTier, isPremium } from "@/utils/premium";
import { cancelPremium, upgradeToPremium } from "@/utils/premium/server";
import type { ChangePremiumStatusOptions } from "@/app/(app)/admin/validation";
import {
  activateLemonLicenseKey,
  getLemonCustomer,
  updateSubscriptionItemQuantity,
} from "@/app/api/lemon-squeezy/api";
import { isAdmin } from "@/utils/admin";
import { PremiumTier } from "@prisma/client";
import { ServerActionResponse } from "@/utils/error";

export async function decrementUnsubscribeCreditAction(): Promise<ServerActionResponse> {
  const session = await auth();
  if (!session?.user.email) return { error: "Not logged in" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      premium: {
        select: {
          id: true,
          unsubscribeCredits: true,
          unsubscribeMonth: true,
          lemonSqueezyRenewsAt: true,
        },
      },
    },
  });

  if (!user) return { error: "User not found" };

  const isUserPremium = isPremium(user.premium?.lemonSqueezyRenewsAt || null);
  if (isUserPremium) return;

  const currentMonth = new Date().getMonth() + 1;

  // create premium row for user if it doesn't already exist
  const premium = user.premium || (await createPremiumForUser(session.user.id));

  if (
    !premium?.unsubscribeMonth ||
    premium?.unsubscribeMonth !== currentMonth
  ) {
    // reset the monthly credits
    await prisma.premium.update({
      where: { id: premium.id },
      data: {
        // reset and use a credit
        unsubscribeCredits: env.NEXT_PUBLIC_FREE_UNSUBSCRIBE_CREDITS - 1,
        unsubscribeMonth: currentMonth,
      },
    });
  } else {
    if (!premium?.unsubscribeCredits || premium.unsubscribeCredits <= 0) return;

    // decrement the monthly credits
    await prisma.premium.update({
      where: { id: premium.id },
      data: { unsubscribeCredits: { decrement: 1 } },
    });
  }
}

export async function updateMultiAccountPremiumAction(
  emails: string[],
): Promise<
  | void
  | { error: string; warning?: string }
  | { error?: string; warning: string }
> {
  return await withServerActionInstrumentation(
    "updateMultiAccountPremium",
    {
      recordResponse: true,
    },
    async () => {
      const session = await auth();
      if (!session?.user.id) return { error: "Not logged in" };

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          premium: {
            select: {
              id: true,
              tier: true,
              lemonSqueezySubscriptionItemId: true,
              emailAccountsAccess: true,
              admins: { select: { id: true } },
            },
          },
        },
      });

      if (!user) return { error: "User not found" };

      if (!isAdminForPremium(user.premium?.admins || [], session.user.id))
        return { error: "Not admin" };

      // check all users exist
      const uniqueEmails = uniq(emails);
      const users = await prisma.user.findMany({
        where: { email: { in: uniqueEmails } },
        select: { id: true, premium: true },
      });

      const premium =
        user.premium || (await createPremiumForUser(session.user.id));

      const otherUsersToAdd = users.filter((u) => u.id !== session.user.id);

      // make sure that the users being added to this plan are not on higher tiers already
      for (const userToAdd of otherUsersToAdd) {
        if (isOnHigherTier(userToAdd.premium?.tier, premium.tier)) {
          return {
            error:
              "One of the users you are adding to your plan already has premium and cannot be added.",
          };
        }
      }

      if ((premium.emailAccountsAccess || 0) < users.length) {
        // TODO lifetime users
        if (!premium.lemonSqueezySubscriptionItemId) {
          return {
            error: `You must upgrade to premium before adding more users to your account. If you already have a premium plan, please contact support at ${env.NEXT_PUBLIC_SUPPORT_EMAIL}`,
          };
        }

        await updateSubscriptionItemQuantity({
          id: premium.lemonSqueezySubscriptionItemId,
          quantity: otherUsersToAdd.length + 1,
        });
      }

      // delete premium for other users when adding them to this premium plan
      // don't delete the premium for the current user
      await prisma.premium.deleteMany({
        where: {
          id: { not: premium.id },
          users: { some: { id: { in: otherUsersToAdd.map((u) => u.id) } } },
        },
      });

      // add users to plan
      await prisma.premium.update({
        where: { id: premium.id },
        data: {
          users: { connect: otherUsersToAdd.map((user) => ({ id: user.id })) },
        },
      });

      if (users.length < uniqueEmails.length) {
        return {
          warning:
            "Not all users exist. Each account must sign up to Inbox Zero to share premium with it.",
        };
      }
    },
  );
}

async function createPremiumForUser(userId: string) {
  return await prisma.premium.create({
    data: {
      users: { connect: { id: userId } },
      admins: { connect: { id: userId } },
    },
  });
}

export async function activateLicenseKeyAction(
  licenseKey: string,
): Promise<ServerActionResponse> {
  const session = await auth();
  if (!session?.user.email) return { error: "Not logged in" };

  const lemonSqueezyLicense = await activateLemonLicenseKey(
    licenseKey,
    `License for ${session.user.email}`,
  );

  if (lemonSqueezyLicense.error) {
    return {
      error: lemonSqueezyLicense.data?.error || "Error activating license",
    };
  }

  const seats = {
    [env.LICENSE_1_SEAT_VARIANT_ID || ""]: 1,
    [env.LICENSE_3_SEAT_VARIANT_ID || ""]: 3,
    [env.LICENSE_5_SEAT_VARIANT_ID || ""]: 5,
    [env.LICENSE_10_SEAT_VARIANT_ID || ""]: 10,
    [env.LICENSE_25_SEAT_VARIANT_ID || ""]: 25,
  };

  await upgradeToPremium({
    userId: session.user.id,
    tier: PremiumTier.LIFETIME,
    lemonLicenseKey: licenseKey,
    lemonLicenseInstanceId: lemonSqueezyLicense.data?.instance?.id,
    emailAccountsAccess: seats[lemonSqueezyLicense.data?.meta.variant_id || ""],
    lemonSqueezyCustomerId: lemonSqueezyLicense.data?.meta.customer_id || null,
    lemonSqueezyOrderId: lemonSqueezyLicense.data?.meta.order_id || null,
    lemonSqueezyProductId: lemonSqueezyLicense.data?.meta.product_id || null,
    lemonSqueezyVariantId: lemonSqueezyLicense.data?.meta.variant_id || null,
    lemonSqueezySubscriptionId: null,
    lemonSqueezySubscriptionItemId: null,
    lemonSqueezyRenewsAt: null,
  });
}

export async function changePremiumStatusAction(
  options: ChangePremiumStatusOptions,
): Promise<ServerActionResponse> {
  const session = await auth();
  if (!session?.user.email) return { error: "Not logged in" };
  if (!isAdmin(session.user.email)) return { error: "Not admin" };

  const userToUpgrade = await prisma.user.findUnique({
    where: { email: options.email },
    select: { id: true, premiumId: true },
  });

  if (!userToUpgrade) return { error: "User not found" };

  const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

  let lemonSqueezySubscriptionId: number | null = null;
  let lemonSqueezySubscriptionItemId: number | null = null;
  let lemonSqueezyOrderId: number | null = null;
  let lemonSqueezyProductId: number | null = null;
  let lemonSqueezyVariantId: number | null = null;

  if (options.upgrade) {
    if (options.lemonSqueezyCustomerId) {
      const lemonCustomer = await getLemonCustomer(
        options.lemonSqueezyCustomerId.toString(),
      );
      if (!lemonCustomer.data) return { error: "Lemon customer not found" };
      const subscription = lemonCustomer.data.included?.find(
        (i) => i.type === "subscriptions",
      );
      if (!subscription) return { error: "Subscription not found" };
      lemonSqueezySubscriptionId = Number.parseInt(subscription.id);
      const attributes = subscription.attributes as any;
      lemonSqueezyOrderId = Number.parseInt(attributes.order_id);
      lemonSqueezyProductId = Number.parseInt(attributes.product_id);
      lemonSqueezyVariantId = Number.parseInt(attributes.variant_id);
      lemonSqueezySubscriptionItemId = attributes.first_subscription_item.id
        ? Number.parseInt(attributes.first_subscription_item.id)
        : null;
    }

    await upgradeToPremium({
      userId: userToUpgrade.id,
      tier: options.period,
      lemonSqueezyCustomerId: options.lemonSqueezyCustomerId || null,
      lemonSqueezySubscriptionId,
      lemonSqueezySubscriptionItemId,
      lemonSqueezyOrderId,
      lemonSqueezyProductId,
      lemonSqueezyVariantId,
      lemonSqueezyRenewsAt:
        options.period === PremiumTier.PRO_ANNUALLY ||
        options.period === PremiumTier.BUSINESS_ANNUALLY
          ? new Date(+new Date() + ONE_MONTH * 12)
          : options.period === PremiumTier.PRO_MONTHLY ||
              options.period === PremiumTier.BUSINESS_MONTHLY
            ? new Date(+new Date() + ONE_MONTH)
            : null,
      emailAccountsAccess: options.emailAccountsAccess,
    });
  } else if (userToUpgrade) {
    if (userToUpgrade.premiumId) {
      await cancelPremium({
        premiumId: userToUpgrade.premiumId,
        lemonSqueezyEndsAt: new Date(),
      });
    } else {
      return { error: "User not premium." };
    }
  }
}

export async function claimPremiumAdminAction(): Promise<ServerActionResponse> {
  const session = await auth();
  if (!session?.user.id) return { error: "Not logged in" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premium: { select: { id: true, admins: true } } },
  });

  if (!user) return { error: "User not found" };
  if (!user.premium?.id) return { error: "User does not have a premium" };
  if (user.premium?.admins.length) return { error: "Already has admin" };

  await prisma.premium.update({
    where: { id: user.premium.id },
    data: { admins: { connect: { id: session.user.id } } },
  });
}
