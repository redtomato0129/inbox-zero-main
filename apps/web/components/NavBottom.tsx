"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChartIcon,
  MailMinusIcon,
  ShieldHalfIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/utils";

function NavBarBottom({
  links,
}: {
  links: {
    path: string;
    label: string;
    icon: React.ElementType;
    isSelected: boolean;
  }[];
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden"
      // safe area for iOS PWA
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <nav className="flex h-14 items-center justify-around">
        {links.map((link) => {
          return (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 hover:text-black",
                link.isSelected ? "text-black" : "text-muted-foreground",
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

const links = [
  {
    path: "/automation",
    label: "AI Automation",
    icon: SparklesIcon,
  },
  {
    path: "/bulk-unsubscribe",
    label: "Unsubscriber",
    icon: MailMinusIcon,
  },
  {
    path: "/cold-email-blocker",
    label: "Cold Email",
    icon: ShieldHalfIcon,
  },
  {
    path: "/stats",
    label: "Analytics",
    icon: BarChartIcon,
  },
];

export function NavBottom() {
  const pathname = usePathname();

  return (
    <NavBarBottom
      links={links.map((link) => ({
        ...link,
        isSelected: pathname === link.path,
      }))}
    />
  );
}
