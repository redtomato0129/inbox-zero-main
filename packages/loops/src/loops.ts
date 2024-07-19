import { LoopsClient } from "loops";

let loops: LoopsClient | undefined;
function getLoopsClient(): LoopsClient | undefined {
  // if loops api key hasn't been set this package doesn't do anything
  if (!process.env.LOOPS_API_SECRET) {
    console.warn("LOOPS_API_SECRET is not set");
    return;
  }

  if (!loops) loops = new LoopsClient(process.env.LOOPS_API_SECRET);

  return loops;
}

export async function createContact(
  email: string,
  firstName?: string,
): Promise<{
  success: boolean;
  id?: string;
}> {
  const loops = getLoopsClient();
  if (!loops) return { success: false };
  const resp = await loops.createContact(email, firstName ? { firstName } : {});
  return resp;
}

export async function deleteContact(
  email: string,
): Promise<{ success: boolean }> {
  const loops = getLoopsClient();
  if (!loops) return { success: false };
  const resp = await loops.deleteContact({ email });
  return resp;
}

export async function upgradedToPremium(
  email: string,
  tier: string,
): Promise<{ success: boolean }> {
  const loops = getLoopsClient();
  if (!loops) return { success: false };
  const resp = await loops.sendEvent({
    eventName: "upgraded",
    email,
    contactProperties: { tier },
    eventProperties: { tier },
  });
  return resp;
}

export async function cancelledPremium(
  email: string,
): Promise<{ success: boolean }> {
  const loops = getLoopsClient();
  if (!loops) return { success: false };
  const resp = await loops.sendEvent({
    eventName: "cancelled",
    email,
    contactProperties: { tier: "" },
  });
  return resp;
}
