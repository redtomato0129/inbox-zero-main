"use server";

import { env } from "@/env";
import {
  lemonSqueezySetup,
  updateSubscriptionItem,
  getCustomer,
  activateLicense,
} from "@lemonsqueezy/lemonsqueezy.js";

let isSetUp = false;

function setUpLemon() {
  if (!env.LEMON_SQUEEZY_API_KEY) return;
  if (isSetUp) return;
  lemonSqueezySetup({ apiKey: env.LEMON_SQUEEZY_API_KEY });
  isSetUp = true;
}

export async function updateSubscriptionItemQuantity(options: {
  id: number;
  quantity: number;
}) {
  setUpLemon();
  return updateSubscriptionItem(options.id, {
    quantity: options.quantity,
    invoiceImmediately: true,
  });
}

export async function getLemonCustomer(customerId: string) {
  setUpLemon();
  return getCustomer(customerId, { include: ["subscriptions", "orders"] });
}

export async function activateLemonLicenseKey(
  licenseKey: string,
  name: string,
) {
  setUpLemon();
  return activateLicense(licenseKey, name);
}
