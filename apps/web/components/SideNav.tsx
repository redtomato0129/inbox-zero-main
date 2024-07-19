"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import {
  AlertCircleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  BarChartBigIcon,
  BookIcon,
  CogIcon,
  CrownIcon,
  FileIcon,
  InboxIcon,
  LightbulbIcon,
  type LucideIcon,
  MailsIcon,
  MessagesSquareIcon,
  PenIcon,
  PersonStandingIcon,
  RatioIcon,
  RibbonIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  Users2Icon,
  XIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useComposeModal } from "@/providers/ComposeModalProvider";
import { env } from "@/env";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon | ((props: any) => React.ReactNode);
  target?: "_blank";
  count?: number;
  hideInMail?: boolean;
};

const NEXT_PUBLIC_DISABLE_TINYBIRD = env.NEXT_PUBLIC_DISABLE_TINYBIRD;

export const navigation: NavItem[] = [
  {
    name: "AI Automation",
    href: "/automation",
    icon: SparklesIcon,
  },
  {
    name: "Cold Email Blocker",
    href: "/cold-email-blocker",
    icon: ShieldCheckIcon,
  },
  ...(NEXT_PUBLIC_DISABLE_TINYBIRD
    ? []
    : [
        {
          name: "Bulk Unsubscribe",
          href: "/bulk-unsubscribe",
          icon: MailsIcon,
        },
      ]),
  ...(NEXT_PUBLIC_DISABLE_TINYBIRD
    ? []
    : [
        {
          name: "Analytics",
          href: "/stats",
          icon: BarChartBigIcon,
        },
      ]),
  // ...(NEXT_PUBLIC_DISABLE_TINYBIRD
  //   ? []
  //   : [
  //       {
  //         name: "New Senders",
  //         href: "/new-senders",
  //         icon: Users2Icon,
  //       },
  //     ]),
  // {
  //   name: "Mail (Alpha)",
  //   href: "/mail",
  //   icon: InboxIcon,
  // },
  // {
  //   name: "Send Email",
  //   href: "/compose",
  //   icon: SendIcon,
  // },
  {
    name: "Early Access",
    href: "/request-access?type=early-access",
    icon: RibbonIcon,
  },
  // {
  //   name: "No reply",
  //   href: "/no-reply",
  //   icon: ChatBubbleBottomCenterTextIcon,
  // },
  // {
  //   name: "Filters",
  //   href: "/filters",
  //   icon: ChartBarIcon,
  // },
  // {
  //   name: "Bulk Archive",
  //   href: "/bulk-archive",
  //   icon: ArchiveBoxArrowDownIcon,
  // },
];

const bottomLinks: NavItem[] = [
  {
    name: "User Guide",
    href: "https://docs.getinboxzero.com",
    target: "_blank",
    icon: BookIcon,
  },
  {
    name: "Join Discord",
    href: "/discord",
    target: "_blank",
    icon: (props: any) => (
      <svg width="100" height="100" viewBox="0 0 24 24" {...props}>
        <path
          fill="currentColor"
          d="M 9.1367188 3.8691406 C 9.1217187 3.8691406 9.1067969 3.8700938 9.0917969 3.8710938 C 8.9647969 3.8810937 5.9534375 4.1403594 4.0234375 5.6933594 C 3.0154375 6.6253594 1 12.073203 1 16.783203 C 1 16.866203 1.0215 16.946531 1.0625 17.019531 C 2.4535 19.462531 6.2473281 20.102859 7.1113281 20.130859 L 7.1269531 20.130859 C 7.2799531 20.130859 7.4236719 20.057594 7.5136719 19.933594 L 8.3886719 18.732422 C 6.0296719 18.122422 4.8248594 17.086391 4.7558594 17.025391 C 4.5578594 16.850391 4.5378906 16.549563 4.7128906 16.351562 C 4.8068906 16.244563 4.9383125 16.189453 5.0703125 16.189453 C 5.1823125 16.189453 5.2957188 16.228594 5.3867188 16.308594 C 5.4157187 16.334594 7.6340469 18.216797 11.998047 18.216797 C 16.370047 18.216797 18.589328 16.325641 18.611328 16.306641 C 18.702328 16.227641 18.815734 16.189453 18.927734 16.189453 C 19.059734 16.189453 19.190156 16.243562 19.285156 16.351562 C 19.459156 16.549563 19.441141 16.851391 19.244141 17.025391 C 19.174141 17.087391 17.968375 18.120469 15.609375 18.730469 L 16.484375 19.933594 C 16.574375 20.057594 16.718094 20.130859 16.871094 20.130859 L 16.886719 20.130859 C 17.751719 20.103859 21.5465 19.463531 22.9375 17.019531 C 22.9785 16.947531 23 16.866203 23 16.783203 C 23 12.073203 20.984172 6.624875 19.951172 5.671875 C 18.047172 4.140875 15.036203 3.8820937 14.908203 3.8710938 C 14.895203 3.8700938 14.880188 3.8691406 14.867188 3.8691406 C 14.681188 3.8691406 14.510594 3.9793906 14.433594 4.1503906 C 14.427594 4.1623906 14.362062 4.3138281 14.289062 4.5488281 C 15.548063 4.7608281 17.094141 5.1895937 18.494141 6.0585938 C 18.718141 6.1975938 18.787437 6.4917969 18.648438 6.7167969 C 18.558438 6.8627969 18.402188 6.9433594 18.242188 6.9433594 C 18.156188 6.9433594 18.069234 6.9200937 17.990234 6.8710938 C 15.584234 5.3800938 12.578 5.3046875 12 5.3046875 C 11.422 5.3046875 8.4157187 5.3810469 6.0117188 6.8730469 C 5.9327188 6.9210469 5.8457656 6.9433594 5.7597656 6.9433594 C 5.5997656 6.9433594 5.4425625 6.86475 5.3515625 6.71875 C 5.2115625 6.49375 5.2818594 6.1985938 5.5058594 6.0585938 C 6.9058594 5.1905937 8.4528906 4.7627812 9.7128906 4.5507812 C 9.6388906 4.3147813 9.5714062 4.1643437 9.5664062 4.1523438 C 9.4894063 3.9813438 9.3217188 3.8691406 9.1367188 3.8691406 z M 12 7.3046875 C 12.296 7.3046875 14.950594 7.3403125 16.933594 8.5703125 C 17.326594 8.8143125 17.777234 8.9453125 18.240234 8.9453125 C 18.633234 8.9453125 19.010656 8.8555 19.347656 8.6875 C 19.964656 10.2405 20.690828 12.686219 20.923828 15.199219 C 20.883828 15.143219 20.840922 15.089109 20.794922 15.037109 C 20.324922 14.498109 19.644687 14.191406 18.929688 14.191406 C 18.332687 14.191406 17.754078 14.405437 17.330078 14.773438 C 17.257078 14.832437 15.505 16.21875 12 16.21875 C 8.496 16.21875 6.7450313 14.834687 6.7070312 14.804688 C 6.2540312 14.407687 5.6742656 14.189453 5.0722656 14.189453 C 4.3612656 14.189453 3.6838438 14.494391 3.2148438 15.025391 C 3.1658438 15.080391 3.1201719 15.138266 3.0761719 15.197266 C 3.3091719 12.686266 4.0344375 10.235594 4.6484375 8.6835938 C 4.9864375 8.8525938 5.3657656 8.9433594 5.7597656 8.9433594 C 6.2217656 8.9433594 6.6724531 8.8143125 7.0644531 8.5703125 C 9.0494531 7.3393125 11.704 7.3046875 12 7.3046875 z M 8.890625 10.044922 C 7.966625 10.044922 7.2167969 10.901031 7.2167969 11.957031 C 7.2167969 13.013031 7.965625 13.869141 8.890625 13.869141 C 9.815625 13.869141 10.564453 13.013031 10.564453 11.957031 C 10.564453 10.900031 9.815625 10.044922 8.890625 10.044922 z M 15.109375 10.044922 C 14.185375 10.044922 13.435547 10.901031 13.435547 11.957031 C 13.435547 13.013031 14.184375 13.869141 15.109375 13.869141 C 16.034375 13.869141 16.783203 13.013031 16.783203 11.957031 C 16.783203 10.900031 16.033375 10.044922 15.109375 10.044922 z"
        ></path>
      </svg>
    ),
    hideInMail: true,
  },
  {
    name: "Feature Requests",
    href: "/feature-requests",
    target: "_blank",
    icon: LightbulbIcon,
    hideInMail: true,
  },
  {
    name: "Star on GitHub",
    href: "/github",
    target: "_blank",
    icon: StarIcon,
    hideInMail: true,
  },
  { name: "Premium", href: "/premium", icon: CrownIcon },
  { name: "Settings", href: "/settings", icon: CogIcon },
];

const topMailLinks: NavItem[] = [
  {
    name: "Inbox",
    icon: InboxIcon,
    href: "?type=inbox",
  },
  {
    name: "Drafts",
    icon: FileIcon,
    href: "?type=draft",
  },
  {
    name: "Sent",
    icon: SendIcon,
    href: "?type=sent",
  },
  {
    name: "Archived",
    icon: ArchiveIcon,
    href: "?type=archive",
  },
];

const bottomMailLinks: NavItem[] = [
  {
    name: "Personal",
    icon: PersonStandingIcon,
    href: "?type=CATEGORY_PERSONAL",
    // count: 972,
  },
  {
    name: "Social",
    icon: Users2Icon,
    href: "?type=CATEGORY_SOCIAL",
    // count: 972,
  },
  {
    name: "Updates",
    icon: AlertCircleIcon,
    href: "?type=CATEGORY_UPDATES",
    // count: 342,
  },
  {
    name: "Forums",
    icon: MessagesSquareIcon,
    href: "?type=CATEGORY_FORUMS",
  },
  {
    name: "Promotions",
    icon: RatioIcon,
    href: "?type=CATEGORY_PROMOTIONS",
  },
];

export function SideNav(props: {
  children: React.ReactNode;
  topBar?: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <div className="h-full">
      <Transition show={props.sidebarOpen} as="div">
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={props.setSidebarOpen}
        >
          <TransitionChild
            as="div"
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as="div"
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex h-full w-full max-w-64 flex-1">
                <TransitionChild
                  as="div"
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => props.setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </TransitionChild>

                <Sidebar isMobile />
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col 2xl:w-64">
        <Sidebar isMobile={false} />
      </div>

      <main className="flex h-full flex-col lg:pl-60 2xl:pl-64">
        {props.topBar}

        {props.children}
      </main>
    </div>
  );
}

function Sidebar(props: { isMobile: boolean }) {
  const path = usePathname();
  const showMailNav = path === "/mail" || path === "/compose";

  const { onOpen } = useComposeModal();

  return (
    <div
      className={clsx(
        "flex grow flex-col gap-y-5 overflow-y-auto bg-black px-6 pb-4",
        {
          "ring-1 ring-white/10": props.isMobile,
        },
      )}
    >
      <Link href="/bulk-unsubscribe">
        <div className="flex h-16 shrink-0 items-center text-white">
          <Logo className="h-4" />
        </div>
      </Link>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col">
          <Transition
            as="div"
            show={showMailNav}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            // leave="transition-opacity duration-300"
            // leaveFrom="opacity-100"
            // leaveTo="opacity-0"
          >
            <Button className="w-full" variant="outline" onClick={onOpen}>
              <PenIcon className="mr-2 h-4 w-4" /> Compose
            </Button>

            <div className="mt-2">
              <Links path={path} links={topMailLinks} />
            </div>
            <div className="mt-7">
              <NavSectionHeader title="Labels" />
              <div className="mt-2">
                <Links path={path} links={bottomMailLinks} />
              </div>
            </div>
          </Transition>

          <Transition
            as="div"
            show={!showMailNav}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            // leave="transition-opacity duration-300"
            // leaveFrom="opacity-100"
            // leaveTo="opacity-0"
          >
            <Links path={path} links={navigation} />
          </Transition>

          <div className="mt-auto pt-7">
            <Links
              path={path}
              links={
                showMailNav
                  ? [
                      {
                        name: "Back",
                        href: "/automation",
                        icon: ArrowLeftIcon,
                      },
                      ...bottomLinks.filter((l) => !l.hideInMail),
                    ]
                  : bottomLinks
              }
            />
          </div>
        </ul>
      </nav>
    </div>
  );
}

function Links(props: { path: string; links: NavItem[] }) {
  return (
    <li>
      <ul role="list" className="-mx-2 space-y-1">
        {props.links.map((item) => (
          <NavLink key={item.name} path={props.path} link={item} />
        ))}
      </ul>
    </li>
  );
}

function NavLink(props: { path: string; link: NavItem }) {
  const { link } = props;

  return (
    <li key={link.name}>
      <Link
        href={link.href}
        className={clsx(
          "group flex h-9 items-center gap-x-3 rounded-md px-3 text-sm font-semibold leading-5 text-white",
          link.href === props.path ? "bg-gray-800" : "hover:bg-gray-800",
        )}
        target={link.target}
        prefetch={link.target !== "_blank"}
      >
        <link.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {link.name}
        {link.count ? (
          <span
            className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-gray-900 px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-white ring-1 ring-inset ring-gray-700"
            aria-hidden="true"
          >
            {link.count}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function NavSectionHeader(props: { title: string }) {
  return (
    <div className="text-xs font-semibold leading-6 text-gray-400">
      {props.title}
    </div>
  );
}
