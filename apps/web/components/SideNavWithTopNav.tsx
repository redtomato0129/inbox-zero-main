"use client";

import { useState } from "react";
import { SideNav } from "@/components/SideNav";
import { TopNav } from "@/components/TopNav";
import { Toaster } from "@/components/Toast";
import { NavBottom } from "@/components/NavBottom";

export function SideNavWithTopNav(props: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SideNav
      topBar={<TopNav setSidebarOpen={setSidebarOpen} />}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <Toaster closeButton richColors theme="light" visibleToasts={9} />
      {props.children}
      <div
        className="md:hidden md:pt-0"
        style={{ paddingTop: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <NavBottom />
      </div>
    </SideNav>
  );
}
