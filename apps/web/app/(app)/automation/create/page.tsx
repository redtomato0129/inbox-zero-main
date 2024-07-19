"use client";

import { useCallback } from "react";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AlertBasic } from "@/components/Alert";
import { Input } from "@/components/Input";
import {
  PageHeading,
  SectionDescription,
  TypographyH3,
} from "@/components/Typography";
import { Button, ButtonLoader } from "@/components/ui/button";
import { createAutomationAction } from "@/utils/actions/ai-rule";
import { isActionError } from "@/utils/error";
import { toastError, toastInfo } from "@/components/Toast";
import { examples } from "@/app/(app)/automation/create/examples";

type Inputs = { prompt?: string };

export default function AutomationSettingsPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = useCallback(
    async (data) => {
      if (data.prompt) {
        const result = await createAutomationAction(data.prompt);

        if (isActionError(result)) {
          const existingRuleId = result.existingRuleId;
          if (existingRuleId) {
            toastInfo({
              title: "Rule for group already exists",
              description: "Edit the existing rule to create your automation.",
            });
            router.push(`/automation/rule/${existingRuleId}`);
          } else {
            toastError({
              description:
                "There was an error creating your automation. " + result.error,
            });
          }
        } else if (!result) {
          toastError({
            description: "There was an error creating your automation.",
          });
        } else {
          router.push(`/automation/rule/${result.id}?new=true`);
        }
      }
    },
    [router],
  );

  const prompt = watch("prompt");

  return (
    <div className="mb-16 mt-6 md:mt-10">
      <PageHeading className="text-center">
        Get started with AI Automation
      </PageHeading>
      <SectionDescription className="text-center">
        Automate your email with AI.
      </SectionDescription>

      <div className="mx-auto mt-6 max-w-xl px-4 md:mt-16">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {typeof prompt === "string" ? (
            <>
              <TypographyH3>
                Instruct the AI how to process an incoming email
              </TypographyH3>

              <Input
                type="text"
                as="textarea"
                rows={4}
                name="prompt"
                placeholder={`eg. Forward receipts to alice@accountant.com.`}
                className="mt-2"
                registerProps={register("prompt")}
                error={errors.prompt}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setValue("prompt", undefined);
                  }}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !prompt || prompt.length < 5}
                >
                  {isSubmitting && <ButtonLoader />}
                  Preview Automation
                </Button>
              </div>
            </>
          ) : (
            <>
              <TypographyH3>Start from an example</TypographyH3>

              <div className="mt-2 space-y-1 text-sm leading-6 text-gray-700">
                {examples.map((example, i) => {
                  return (
                    <Link
                      key={example.title}
                      className="block w-full text-left"
                      href={`/automation/rule/create?example=${i}`}
                    >
                      <AlertBasic
                        title={example.title}
                        description={example.rule.instructions}
                        icon={example.icon}
                        className="cursor-pointer hover:bg-gray-100"
                      />
                    </Link>
                  );
                })}
              </div>

              <TypographyH3 className="pt-8">
                Or set up a rule yourself
              </TypographyH3>
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/automation/rule/create">Create rule</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setValue("prompt", "");
                  }}
                >
                  Generate rule with AI
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
