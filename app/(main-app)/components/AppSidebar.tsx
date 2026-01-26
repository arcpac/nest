"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Apple,
  AppleIcon,
  BarChart2Icon,
  Bell,
  BookOpen,

  FileText,
  Frame,
  HandCoins,
  History,
  LayoutDashboardIcon,
  LifeBuoy,
  ListIcon,
  Map,
  PieChart,
  Receipt,
  Send,
  Settings2,
  Timer,
  Upload,
  UserPlus,
} from "lucide-react";
import { UserNav } from "./UserNav";
import { ItemsWithDropdown } from "./ItemsWithDropdown";
import { NavWithChildren } from "./NavWithChildren";
import MainNav from "./MainNav";
import { useDataStore } from "@/app/DataProvider";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  // Top-level quick nav (core screens)
  mainNav: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Groups",
      url: "/groups",
      icon: ListIcon,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: ListIcon,
    },

    // Senior-signal additions
    {
      title: "Settle Up",
      url: "/settlements",
      icon: HandCoins, // or CreditCard
    },
    {
      title: "Receipts",
      url: "/receipts",
      icon: Receipt,
    },
    {
      title: "Activity",
      url: "/activity",
      icon: History, // audit trail / event log vibe
    },

    // Nice-to-have
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart2Icon,
    },
  ],

  // Grouped sections (feature areas / settings)
  navWithChildren: [
    {
      title: "Imports",
      url: "/imports",
      icon: Upload,
      items: [
        { title: "Bank CSV Import", url: "/imports/bank-csv" },
        { title: "Rules & Mapping", url: "/imports/rules" },
        { title: "Import History", url: "/imports/history" },
      ],
    },

    {
      title: "Invites",
      url: "/invites",
      icon: UserPlus,
      items: [
        { title: "Invite Members", url: "/invites/new" },
        { title: "Magic Links", url: "/invites/links" },
        { title: "Pending Invites", url: "/invites/pending" },
      ],
    },

    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
      items: [
        { title: "Preferences", url: "/notifications/preferences" },
        { title: "Email Templates", url: "/notifications/email" },
        { title: "Push (PWA)", url: "/notifications/push" },
        { title: "Delivery Logs", url: "/notifications/logs" },
      ],
    },

    {
      title: "Automation",
      url: "/automation",
      icon: Timer, // or Repeat
      items: [
        { title: "Recurring Expenses", url: "/automation/recurring" },
        { title: "Monthly Summaries", url: "/automation/summaries" },
        { title: "Background Jobs", url: "/automation/jobs" },
      ],
    },

    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        { title: "Profile", url: "/settings/profile" },
        { title: "Household & Roles", url: "/settings/household" },
        { title: "Billing / Plans", url: "/settings/billing" },
        { title: "Data Export", url: "/settings/export" },
      ],
    },
  ],

  navSecondary: [
    { title: "Support", url: "/support", icon: LifeBuoy },
    { title: "Feedback", url: "/feedback", icon: Send },
    { title: "Docs", url: "/docs", icon: BookOpen },
    { title: "Changelog", url: "/changelog", icon: FileText },
  ],

  // Optional: keep or repurpose this section as “Quick Links”
  projects: [
    { name: "Templates", url: "/templates", icon: Frame },
    { name: "Categories", url: "/categories", icon: PieChart },
    { name: "Locations", url: "/locations", icon: Map },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const user = useDataStore((s) => s.sessionUser);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div onClick={() => toggleSidebar()}>
                <AppleIcon className="!size-5" />
                <span className="text-base font-semibold">{user?.name}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <MainNav items={data.mainNav} />
        <NavWithChildren items={data.navWithChildren} />
        <ItemsWithDropdown projects={data.projects} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <UserNav user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
