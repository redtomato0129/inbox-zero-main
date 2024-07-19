import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { withError } from "@/utils/middleware";
import { env } from "@/env";
import { posthogCaptureEvent } from "@/utils/posthog";
import {
  cancelPremium,
  editEmailAccountsAccess,
  extendPremium,
  upgradeToPremium,
} from "@/utils/premium/server";
import type { Payload } from "@/app/api/lemon-squeezy/webhook/types";
import { PremiumTier } from "@prisma/client";
import { cancelledPremium, upgradedToPremium } from "@inboxzero/loops";

export const POST = withError(async (request: Request) => {
  const payload = await getPayload(request);
  const userId = payload.meta.custom_data?.user_id;

  console.log("===Lemon event type:", payload.meta.event_name);

  // ignored events
  if (["subscription_payment_success"].includes(payload.meta.event_name)) {
    return NextResponse.json({ ok: true });
  }

  // monthly/annual subscription
  if (payload.meta.event_name === "subscription_created") {
    if (!userId) throw new Error("No userId provided");
    return await subscriptionCreated({ payload, userId });
  }

  const variant = payload.data.attributes.first_order_item?.variant_id;
  const isLifetimePlan = variant === env.NEXT_PUBLIC_LIFETIME_VARIANT_ID;

  // lifetime plan
  if (payload.meta.event_name === "order_created" && isLifetimePlan) {
    if (!userId) throw new Error("No userId provided");
    return await lifetimeOrder({ payload, userId });
  }

  const lemonSqueezyCustomerId = payload.data.attributes.customer_id;

  const premium = await prisma.premium.findFirst({
    where: { lemonSqueezyCustomerId },
    select: { id: true },
  });
  const premiumId = premium?.id;

  if (!premiumId) {
    throw new Error(
      `No user found for lemonSqueezyCustomerId ${lemonSqueezyCustomerId}`,
    );
  }

  // extra seats for lifetime plan
  const isLifetimeSeatPlan =
    variant === env.NEXT_PUBLIC_LIFETIME_EXTRA_SEATS_VARIANT_ID;
  if (payload.meta.event_name === "order_created") {
    if (isLifetimeSeatPlan) {
      return await lifetimeSeatOrder({ payload, premiumId });
    } else {
      // license plan - not handled here
      return NextResponse.json({ ok: true });
    }
  }

  // renewal
  if (payload.meta.event_name === "subscription_updated") {
    return await subscriptionUpdated({ payload, premiumId });
  }

  // cancellation
  if (payload.data.attributes.ends_at) {
    return await subscriptionCancelled({
      payload,
      premiumId,
      endsAt: payload.data.attributes.ends_at,
    });
  }

  return NextResponse.json({ ok: true });
});

// https://docs.lemonsqueezy.com/help/webhooks#signing-requests
// https://gist.github.com/amosbastian/e403e1d8ccf4f7153f7840dd11a85a69
async function getPayload(request: Request): Promise<Payload> {
  if (!env.LEMON_SQUEEZY_SIGNING_SECRET)
    throw new Error("No Lemon Squeezy signing secret provided.");

  const text = await request.text();
  const hmac = crypto.createHmac("sha256", env.LEMON_SQUEEZY_SIGNING_SECRET);
  const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
  const signature = Buffer.from(
    request.headers.get("x-signature") as string,
    "utf8",
  );

  if (!crypto.timingSafeEqual(digest, signature))
    throw new Error("Invalid signature.");

  const payload: Payload = JSON.parse(text);

  return payload;
}

async function subscriptionCreated({
  payload,
  userId,
}: {
  payload: Payload;
  userId: string;
}) {
  if (!payload.data.attributes.renews_at)
    throw new Error("No renews_at provided");

  const lemonSqueezyRenewsAt = new Date(payload.data.attributes.renews_at);

  if (!payload.data.attributes.first_subscription_item)
    throw new Error("No subscription item");

  const tier = getSubscriptionTier({
    variantId: payload.data.attributes.variant_id,
  });

  const updatedPremium = await upgradeToPremium({
    userId,
    tier,
    lemonSqueezyRenewsAt,
    lemonSqueezySubscriptionId:
      payload.data.attributes.first_subscription_item.subscription_id,
    lemonSqueezySubscriptionItemId:
      payload.data.attributes.first_subscription_item.id,
    lemonSqueezyOrderId: null,
    lemonSqueezyCustomerId: payload.data.attributes.customer_id,
    lemonSqueezyProductId: payload.data.attributes.product_id,
    lemonSqueezyVariantId: payload.data.attributes.variant_id,
  });

  const email = getEmailFromPremium(updatedPremium);
  if (email) {
    await Promise.allSettled([
      posthogCaptureEvent(email, "Upgraded to premium", {
        ...payload.data.attributes,
        $set: { premium: true, premiumTier: "subscription" },
      }),
      upgradedToPremium(email, tier),
    ]);
  }

  return NextResponse.json({ ok: true });
}

async function lifetimeOrder({
  payload,
  userId,
}: {
  payload: Payload;
  userId: string;
}) {
  if (!payload.data.attributes.first_order_item)
    throw new Error("No order item");

  const updatedPremium = await upgradeToPremium({
    userId,
    tier: PremiumTier.LIFETIME,
    lemonSqueezySubscriptionId: null,
    lemonSqueezySubscriptionItemId: null,
    lemonSqueezyRenewsAt: null,
    lemonSqueezyOrderId: payload.data.attributes.first_order_item.order_id,
    lemonSqueezyCustomerId: payload.data.attributes.customer_id,
    lemonSqueezyProductId: payload.data.attributes.product_id,
    lemonSqueezyVariantId: payload.data.attributes.variant_id,
  });

  const email = getEmailFromPremium(updatedPremium);
  if (email) {
    await Promise.allSettled([
      posthogCaptureEvent(email, "Upgraded to lifetime plan", {
        ...payload.data.attributes,
        $set: { premium: true, premiumTier: "lifetime" },
      }),
      upgradedToPremium(email, PremiumTier.LIFETIME),
    ]);
  }

  return NextResponse.json({ ok: true });
}

async function lifetimeSeatOrder({
  payload,
  premiumId,
}: {
  payload: Payload;
  premiumId: string;
}) {
  if (!payload.data.attributes.first_order_item)
    throw new Error("No order item");

  const updatedPremium = await editEmailAccountsAccess({
    premiumId,
    count: payload.data.attributes.first_order_item.quantity,
  });

  const email = updatedPremium && getEmailFromPremium(updatedPremium);
  if (email) {
    await posthogCaptureEvent(email, "Added seats to lifetime plan", {
      ...payload.data.attributes,
      $set: { premium: true, premiumTier: "lifetime" },
    });
  }

  return NextResponse.json({ ok: true });
}

async function subscriptionUpdated({
  payload,
  premiumId,
}: {
  payload: Payload;
  premiumId: string;
}) {
  if (!payload.data.attributes.renews_at)
    throw new Error("No renews_at provided");

  const updatedPremium = await extendPremium({
    premiumId,
    lemonSqueezyRenewsAt: new Date(payload.data.attributes.renews_at),
  });

  const email = getEmailFromPremium(updatedPremium);
  if (email) {
    await posthogCaptureEvent(email, "Premium subscription payment success", {
      ...payload.data.attributes,
      $set: { premium: true, premiumTier: "subscription" },
    });
  }

  return NextResponse.json({ ok: true });
}

async function subscriptionCancelled({
  payload,
  premiumId,
  endsAt,
}: {
  payload: Payload;
  premiumId: string;
  endsAt: NonNullable<Payload["data"]["attributes"]["ends_at"]>;
}) {
  const updatedPremium = await cancelPremium({
    premiumId,
    lemonSqueezyEndsAt: new Date(endsAt),
  });

  const email = getEmailFromPremium(updatedPremium);
  if (email) {
    await Promise.allSettled([
      posthogCaptureEvent(email, "Cancelled premium subscription", {
        ...payload.data.attributes,
        $set: { premiumCancelled: true, premium: false },
      }),
      cancelledPremium(email),
    ]);
  }

  return NextResponse.json({ ok: true });
}

function getEmailFromPremium(premium: {
  users: Array<{ email: string | null }>;
}) {
  return premium.users?.[0]?.email;
}

function getSubscriptionTier({
  variantId,
}: {
  variantId: number;
}): PremiumTier {
  switch (variantId) {
    case env.NEXT_PUBLIC_BASIC_MONTHLY_VARIANT_ID:
      return PremiumTier.BASIC_MONTHLY;
    case env.NEXT_PUBLIC_BASIC_ANNUALLY_VARIANT_ID:
      return PremiumTier.BASIC_ANNUALLY;

    case env.NEXT_PUBLIC_PRO_MONTHLY_VARIANT_ID:
      return PremiumTier.PRO_MONTHLY;
    case env.NEXT_PUBLIC_PRO_ANNUALLY_VARIANT_ID:
      return PremiumTier.PRO_ANNUALLY;

    case env.NEXT_PUBLIC_BUSINESS_MONTHLY_VARIANT_ID:
      return PremiumTier.BUSINESS_MONTHLY;
    case env.NEXT_PUBLIC_BUSINESS_ANNUALLY_VARIANT_ID:
      return PremiumTier.BUSINESS_ANNUALLY;
  }

  throw new Error(`Unknown variant id: ${variantId}`);
}
