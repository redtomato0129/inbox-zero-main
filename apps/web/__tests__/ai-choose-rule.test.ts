import { expect, test, vi } from "vitest";
import { chooseRule } from "@/utils/ai/choose-rule/choose";
import { Action, ActionType, RuleType } from "@prisma/client";

vi.mock("server-only", () => ({}));

test("Should return no rule when no rules passed", async () => {
  const result = await chooseRule({
    rules: [],
    email: getEmail(),
    user: getUser(),
  });

  expect(result).toEqual({ reason: "No rules" });
});

test("Should return correct rule when only one rule passed", async () => {
  const rule = getRule(
    "Match emails that have the word 'test' in the subject line",
  );

  const result = await chooseRule({
    email: getEmail({ subject: "test" }),
    rules: [rule],
    user: getUser(),
  });

  expect(result).toEqual({ rule, reason: expect.any(String), actionItems: [] });
});

test("Should return correct rule when multiple rules passed", async () => {
  const rule1 = getRule(
    "Match emails that have the word 'test' in the subject line",
  );
  const rule2 = getRule(
    "Match emails that have the word 'remember' in the subject line",
  );

  const result = await chooseRule({
    rules: [rule1, rule2],
    email: getEmail({ subject: "remember that call" }),
    user: getUser(),
  });

  expect(result).toEqual({
    rule: rule2,
    reason: expect.any(String),
    actionItems: [],
  });
});

test("Should generate action arguments", async () => {
  const rule1 = getRule(
    "Match emails that have the word 'question' in the subject line",
  );
  const rule2 = getRule("Match emails asking for a joke", [
    {
      id: "id",
      createdAt: new Date(),
      updatedAt: new Date(),
      type: ActionType.REPLY,
      ruleId: "ruleId",
      label: null,
      subject: null,
      content: null,
      to: null,
      cc: null,
      bcc: null,

      labelPrompt: null,
      subjectPrompt: null,
      contentPrompt: "Write a joke",
      toPrompt: null,
      ccPrompt: null,
      bccPrompt: null,
    },
  ]);

  const result = await chooseRule({
    rules: [rule1, rule2],
    email: getEmail({ subject: "Joke", content: "Tell me a joke about sheep" }),
    user: getUser(),
  });

  console.debug("Generated content:\n", result.actionItems?.[0].content);

  expect(result).toEqual({
    rule: rule2,
    reason: expect.any(String),
    actionItems: [
      {
        bcc: null,
        cc: null,
        content: expect.any(String),
        label: null,
        subject: null,
        to: null,
        type: "REPLY",
      },
    ],
  });
});

// helpers
function getRule(instructions: string, actions: Action[] = []) {
  return {
    instructions,
    name: "Joke requests",
    actions,
    id: "id",
    userId: "userId",
    createdAt: new Date(),
    updatedAt: new Date(),
    automate: false,
    runOnThreads: false,
    groupId: null,
    from: null,
    subject: null,
    body: null,
    to: null,
    type: RuleType.AI,
  };
}

function getEmail({
  from = "from@test.com",
  subject = "subject",
  content = "content",
}: { from?: string; subject?: string; content?: string } = {}) {
  return {
    from,
    subject,
    content,
  };
}

function getUser() {
  return {
    aiModel: "gpt-4o-mini",
    aiProvider: "openai",
    email: "user@test.com",
    openAIApiKey: null,
    about: null,
  };
}
