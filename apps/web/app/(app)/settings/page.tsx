import { FormWrapper } from "@/components/Form";
import { AboutSection } from "@/app/(app)/settings/AboutSection";
// import { LabelsSection } from "@/app/(app)/settings/LabelsSection";
import { DeleteSection } from "@/app/(app)/settings/DeleteSection";
import { ModelSection } from "@/app/(app)/settings/ModelSection";
import { EmailUpdatesSection } from "@/app/(app)/settings/EmailUpdatesSection";
import { MultiAccountSection } from "@/app/(app)/settings/MultiAccountSection";

export default function Settings() {
  return (
    <FormWrapper>
      <AboutSection />
      {/* <LabelsSection /> */}
      <ModelSection />
      <EmailUpdatesSection />
      <MultiAccountSection />
      <DeleteSection />
    </FormWrapper>
  );
}
