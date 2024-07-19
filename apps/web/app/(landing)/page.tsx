import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/app/(landing)/home/Hero";
import {
  Features,
  FeaturesUnsubscribe,
  FeaturesAutomation,
  FeaturesColdEmailBlocker,
  FeaturesStats,
} from "@/app/(landing)/home/Features";
import { Testimonials } from "@/app/(landing)/home/Testimonials";
import { Pricing } from "@/app/(app)/premium/Pricing";
import { FAQs } from "@/app/(landing)/home/FAQs";
import { CTA } from "@/app/(landing)/home/CTA";
import { BasicLayout } from "@/components/layouts/BasicLayout";
// import { HeroHeadingAB, HeroSubtitleAB } from "@/app/(landing)/home/HeroAB";
// import { env } from "@/env";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <BasicLayout>
      <Hero
      // title={
      //   env.NEXT_PUBLIC_POSTHOG_HERO_AB ? (
      //     <Suspense>
      //       <HeroHeadingAB variantKey={env.NEXT_PUBLIC_POSTHOG_HERO_AB} />
      //     </Suspense>
      //   ) : undefined
      // }
      // subtitle={
      //   env.NEXT_PUBLIC_POSTHOG_HERO_AB ? (
      //     <Suspense>
      //       <HeroSubtitleAB variantKey={env.NEXT_PUBLIC_POSTHOG_HERO_AB} />
      //     </Suspense>
      //   ) : undefined
      // }
      />
      <Testimonials />
      <Features />
      <FeaturesAutomation />
      <FeaturesUnsubscribe />
      <FeaturesColdEmailBlocker />
      <FeaturesStats />
      <Suspense>
        <div className="pb-32">
          <Pricing />
        </div>
      </Suspense>
      <FAQs />
      <CTA />
    </BasicLayout>
  );
}
