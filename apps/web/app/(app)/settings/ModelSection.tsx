"use client";

import { useCallback, useMemo } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import useSWR from "swr";
import { Button } from "@/components/Button";
import { FormSection, FormSectionLeft } from "@/components/Form";
import { toastError, toastSuccess } from "@/components/Toast";
import { Input } from "@/components/Input";
import { isError } from "@/utils/error";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingContent } from "@/components/LoadingContent";
import type { UserResponse } from "@/app/api/user/me/route";
import { postRequest } from "@/utils/api";
import {
  saveSettingsBody,
  type SaveSettingsBody,
} from "@/app/api/user/settings/validation";
import type { SaveSettingsResponse } from "@/app/api/user/settings/route";
import { Select } from "@/components/Select";
import type { OpenAiModelsResponse } from "@/app/api/ai/models/route";
import { AlertError } from "@/components/Alert";

export function ModelSection() {
  const { data, isLoading, error, mutate } =
    useSWR<UserResponse>("/api/user/me");
  const { data: dataModels, isLoading: isLoadingModels } =
    useSWR<OpenAiModelsResponse>(data?.openAIApiKey ? "/api/ai/models" : null);

  return (
    <FormSection>
      <FormSectionLeft
        title="AI Model"
        description="Choose your AI model and use your own API key."
      />

      <LoadingContent loading={isLoading || isLoadingModels} error={error}>
        {data && (
          <ModelSectionForm
            aiModel={data.aiModel}
            openAIApiKey={data.openAIApiKey}
            models={dataModels}
            refetchUser={mutate}
          />
        )}
      </LoadingContent>
    </FormSection>
  );
}

function ModelSectionForm(props: {
  aiModel: string | null;
  openAIApiKey: string | null;
  models?: OpenAiModelsResponse;
  refetchUser: () => void;
}) {
  const { refetchUser } = props;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaveSettingsBody>({
    resolver: zodResolver(saveSettingsBody),
    defaultValues: {
      aiModel: props.aiModel ?? undefined,
      openAIApiKey: props.openAIApiKey ?? undefined,
    },
  });

  const onSubmit: SubmitHandler<SaveSettingsBody> = useCallback(
    async (data) => {
      const res = await postRequest<SaveSettingsResponse, SaveSettingsBody>(
        "/api/user/settings",
        data,
      );

      if (isError(res)) {
        toastError({
          description: "There was an error updating the settings.",
        });
      } else {
        toastSuccess({ description: "Settings updated!" });
      }

      refetchUser();
    },
    [refetchUser],
  );

  const options: { label: string; value: string }[] = useMemo(
    () =>
      props.models?.length
        ? props.models?.map((m) => ({
            label: m.id,
            value: m.id,
          }))
        : [
            {
              label: "GPT-4o mini",
              value: "gpt-4o-mini",
            },
            {
              label: "GPT-4o",
              value: "gpt-4o",
            },
          ],
    [props.models],
  );

  const globalError = (errors as any)[""];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        name="aiModel"
        label="Model"
        options={options}
        registerProps={register("aiModel")}
        error={errors.aiModel}
      />

      <Input
        type="password"
        name="openAIApiKey"
        label="OpenAI API Key"
        registerProps={register("openAIApiKey")}
        error={errors.openAIApiKey}
      />

      {globalError && (
        <AlertError title="Error saving" description={globalError.message} />
      )}

      <Button type="submit" loading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
