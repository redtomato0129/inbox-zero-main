// import { getAiResponse, planAct } from "@/app/api/ai/act/controller";
// import { ChatCompletionCreateParams } from "openai/resources/index";

// // NOTE: these tests cost money to run as they call the OpenAI API.
// // Be careful when running them in watch mode as they'll run on every file change.

// // Improving the AI is a lot of trial and error.
// // This test suite makes it easier to test different models and parameters.

// const TIMEOUT = 15_000;
// const MODEL = "gpt-4o" as const;

// const functions: ChatCompletionCreateParams.Function[] = [
//   {
//     name: "forward_receipts",
//     description: "Forward receipts to my accountant",
//     parameters: {
//       type: "object",
//       properties: {
//         to: {
//           type: "string",
//           description:
//             "Comma separated email addresses of the recipients to forward the email to.",
//         },
//         cc: {
//           type: "string",
//           description:
//             "Comma separated email addresses of the cc recipients to forward the email to.",
//         },
//         bcc: {
//           type: "string",
//           description:
//             "Comma separated email addresses of the bcc recipients to forward the email to.",
//         },
//         content: {
//           type: "string",
//           description: "Extra content to add to the forwarded email.",
//         },
//       },
//       required: ["to"],
//     },
//   },
//   // {
//   //   name: "requires_more_information",
//   //   description: "Request more information to handle the email",
//   //   parameters: {
//   //     type: "object",
//   //     properties: {},
//   //     required: [],
//   //   },
//   // },
//   {
//     name: "haro",
//     description:
//       "If I get an email from HARO asking me questions, choose one of the questions, and send an email with the answer. The email address to send the answer to is noted in the email.\n" +
//       "\n" +
//       "Prefer to answer questions about startups, crypto, and AI.",
//     parameters: {
//       type: "object",
//       properties: {
//         cc: {
//           type: "string",
//           description:
//             "A comma separated list of email addresses of the cc recipients to send to.",
//         },
//         bcc: {
//           type: "string",
//           description:
//             "A comma separated list of email addresses of the bcc recipients to send to.",
//         },
//         content: {
//           type: "string",
//           description: "The content to send in the reply.",
//         },
//       },
//       required: ["to", "subject", "content"],
//     },
//   },
//   {
//     name: "cold_email",
//     description: 'Label all cold emails as "Cold Email" and archive them.',
//     parameters: {
//       type: "object",
//       properties: {
//         label: {
//           type: "string",
//           description: "The name of the label.",
//         },
//       },
//       required: ["label"],
//     },
//   },
//   {
//     name: "requires_more_information",
//     description: "Request more information to handle the email.",
//     parameters: { type: "object", properties: {}, required: [] },
//   },
// ];

// const noRule = functions.length;

// describe("AI Plan 1", () => {
//   const options = {
//     model: MODEL,
//     email: {
//       from: "billing@stripe.com",
//       subject: "Your receipt from IZ",
//       content: "Receipt from IZ. Amount: $10. Thanks for your business!",
//       snippet: "Receipt from IZ. Amount: $10. Thanks for your business!",
//     },
//     functions,
//     userAbout: "",
//     userEmail: "",
//     aiModel: MODEL,
//     openAIApiKey: null,
//   };

//   it(
//     "AI follows rule (without function calling)",
//     async () => {
//       const response = await getAiResponse(options);
//       expect(response).toEqual({
//         rule: 1,
//       });
//     },
//     TIMEOUT,
//   );
// });

// describe("AI Plan 2", () => {
//   const options = {
//     email: {
//       from: "Max Percy <notifications@github.com>",
//       subject:
//         "Re: [upstash/sdk-qstash-ts] Question: would the queue process in sequence (Issue #32)",
//       content: `With v2 we've laid the foundation to make this possible, but we got other things in the pipeline first, so not likely to be in the next 1-2 months

// —
// Reply to this email directly, view it on GitHub, or unsubscribe.
// You are receiving this because you commented.Message ID: <upstash/sdk-qstash-ts/issues/32/1708038228@github.com`,
//       snippet:
//         "With v2 we've laid the foundation to make this possible, but we got other things in the pipeline first, so not likely to be in the next 1-2 months",
//     },
//     functions,
//     userAbout: "",
//     userEmail: "",
//     aiModel: MODEL,
//     openAIApiKey: null,
//   };

//   // fails with gpt 3.5 turbo
//   // it(
//   //   "AI follows rule",
//   //   async () => {
//   //     const response = await getAiResponse(options);
//   //     expect(response).toBeUndefined();
//   //   },
//   //   TIMEOUT
//   // );

//   it(
//     "AI follows rule (without function calling)",
//     async () => {
//       const response = await getAiResponse(options);
//       expect(response).toEqual({
//         rule: noRule,
//       });
//     },
//     TIMEOUT,
//   );
// });

// describe("Plan act", () => {
//   const options = {
//     email: {
//       from: "billing@stripe.com",
//       subject: "Your receipt from IZ",
//       content: "Receipt from IZ. Amount: $10. Thanks for your business!",
//       snippet: "Receipt from IZ. Amount: $10. Thanks for your business!",
//       threadId: "thread1",
//       messageId: "message1",
//       headerMessageId: "headerMessage1",
//     },
//     functions,
//     userAbout: "",
//     userEmail: "",
//     aiModel: MODEL,
//     openAIApiKey: null,
//     rules: functions.map((f) => {
//       return {
//         instructions: f.description || "",
//         name: f.name,
//         actions: [],

//         id: "rule1",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         userId: "user1",
//         automate: false,
//       };
//     }),
//   };

//   it.only(
//     "Should plan act",
//     async () => {
//       const response = await planAct(options as any); // TODO fix
//       expect(response).toEqual({
//         rule: noRule,
//       });
//     },
//     TIMEOUT,
//   );
// });
