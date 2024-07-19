import clsx from "clsx";
import {
  BarChart2Icon,
  EyeIcon,
  LineChart,
  type LucideIcon,
  MousePointer2Icon,
  Orbit,
  ShieldHalfIcon,
  Sparkles,
  SparklesIcon,
  TagIcon,
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    name: "Reply Automatically",
    description:
      "Tell Inbox Zero how to handle your emails and it will do it for you. Automatically reply, archive, and label emails based on your instructions.",
    icon: Sparkles,
  },
  {
    name: "Automatically archive cold emails",
    description:
      "Sick of cold emails? Inbox Zero can automatically archive and label them for you so they don't clog your inbox.",
    icon: Orbit,
  },
  {
    name: "Explain it in plain English",
    description:
      "Tell Inbox Zero how to handle your emails in plain English. It's as simple as writing to an assistant or ChatGPT.",
    icon: LineChart,
  },
];

function FeaturesOld() {
  return (
    <div className="bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="font-cal text-base leading-7 text-blue-600">
            Handle emails faster
          </h2>
          <p className="mt-2 font-cal text-3xl text-gray-900 sm:text-4xl">
            Respond faster. Remove the clutter. Get your time back.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Running a small business you{"'"}re constantly bombarded with the
            same questions. Save your time and your customers time by having our
            AI answer them for you.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon
                    className="h-5 w-5 flex-none text-blue-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  {/* <p className="mt-6">
                    <a
                      href="#"
                      className="text-sm font-semibold leading-6 text-blue-600"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p> */}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <div className="bg-white py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="font-cal text-base leading-7 text-blue-600">
            Privacy first
          </h2>
          <p className="mt-2 font-cal text-3xl text-gray-900 sm:text-4xl">
            Approved by Google. Open Source. See exactly what our code does. Or
            host it yourself.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Inbox Zero has undergone a thorough security process with Google to
            ensure the protection of your emails. You can even self-host Inbox
            Zero on your own infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesWithImage(props: {
  imageSide: "left" | "right";
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: {
    name: string;
    description: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div
            className={clsx(
              "lg:pt-4",
              props.imageSide === "left"
                ? "lg:ml-auto lg:pl-4"
                : "lg:mr-auto lg:pr-4",
            )}
          >
            <div className="lg:max-w-lg">
              <h2 className="font-cal text-base leading-7 text-blue-600">
                {props.title}
              </h2>
              <p className="mt-2 font-cal text-3xl text-gray-900 sm:text-4xl">
                {props.subtitle}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {props.description}
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {props.features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        className="absolute left-1 top-1 h-5 w-5 text-blue-600"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div
            className={clsx(
              "flex items-start",
              props.imageSide === "left"
                ? "justify-end lg:order-first"
                : "justify-start lg:order-last",
            )}
          >
            <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
              <Image
                src={props.image}
                alt="Product screenshot"
                className="w-[48rem] max-w-none rounded-xl shadow-2xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                width={2400}
                height={1800}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const featuresAutomations = [
  {
    name: "Automate your replies",
    description:
      "Our AI agent will reply, forward, or archive emails based on the rules you provide it.",
    icon: Sparkles,
  },
  {
    name: "Planning mode",
    description:
      "Let our AI plan what to do for you. Accept or reject in a click. Turn on full automation once you're confident the AI can work on its own.",
    icon: Orbit,
  },
  {
    name: "Instruct in plain English",
    description:
      "It's as easy as talking to an assistant or sending a prompt to ChatGPT.",
    icon: LineChart,
  },
];

export function FeaturesAutomation() {
  return (
    <FeaturesWithImage
      imageSide="left"
      title="Automate your inbox"
      subtitle="Your AI assistant for email"
      description="Keep getting emails that require the same response? Let Inbox Zero handle it."
      image="/images/ai-automation.png"
      features={featuresAutomations}
    />
  );
}

const featuresColdEmailBlocker = [
  {
    name: "Block out the noise",
    description:
      "Automatically archive or label cold emails. Keep your inbox clean and focused on what matters.",
    icon: ShieldHalfIcon,
  },
  {
    name: "Adjust cold email prompt",
    description:
      "Tell Inbox Zero what constitutes a cold email for you. It will block them based on your instructions.",
    icon: SparklesIcon,
  },
  {
    name: "Label cold emails",
    description:
      "Automatically label cold emails so you can review them later. Keep your inbox clean and focused on what matters.",
    icon: TagIcon,
  },
];

export function FeaturesColdEmailBlocker() {
  return (
    <FeaturesWithImage
      imageSide="left"
      title="Cold Email Blocker"
      subtitle="Automatically block cold emails"
      description="Stop the spam. Automatically archive or label cold emails."
      image="/images/cold-email-blocker.png"
      features={featuresColdEmailBlocker}
    />
  );
}

const featuresStats = [
  {
    name: "Who emails you most",
    description:
      "Someone emailing you too much? Figure out a plan to handle this better.",
    icon: Sparkles,
  },
  {
    name: "Who you email most",
    description:
      "If there's one person you're constantly speaking to is there a better way for you to speak?",
    icon: Orbit,
  },
  {
    name: "What type of emails you get",
    description:
      "Getting a lot of newsletters or cold emails? Try automatically archiving and labelling them with our AI.",
    icon: LineChart,
  },
];

export function FeaturesStats() {
  return (
    <FeaturesWithImage
      imageSide="right"
      title="Inbox Analytics"
      subtitle="Understand your inbox"
      description="Understanding your inbox is the first step to dealing with it. Understand what is filling up your inbox. Then figure out an action plan to deal with it."
      image="/images/analytics.png"
      features={featuresStats}
    />
  );
}

const featuresUnsubscribe = [
  {
    name: "One-click unsubscribe",
    description:
      "Don't search for the unsubscribe button. Unsubscribe with a single click or auto archive emails instead.",
    icon: MousePointer2Icon,
  },
  {
    name: "See who emails you most",
    description:
      "See who's sending you the most marketing and newsletter emails to prioritise who to unsubscribe from.",
    icon: EyeIcon,
  },
  {
    name: "How often they email",
    description:
      "View analytic charts to see how often you get emails from certain senders to take action.",
    icon: BarChart2Icon,
  },
];

export function FeaturesUnsubscribe() {
  return (
    <FeaturesWithImage
      imageSide="right"
      title="Newsletter Cleaner"
      subtitle="Clean up your subscriptions"
      description="See all newsletter and marketing subscriptions in one place. Unsubscribe in a click."
      image="/images/newsletters.png"
      features={featuresUnsubscribe}
    />
  );
}
