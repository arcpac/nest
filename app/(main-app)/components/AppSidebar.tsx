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
  Activity,
  AppleIcon,
  Banknote,
  BarChart2Icon,
  Bell,
  BookOpen,
  Clapperboard,
  Cog,
  Compass,
  Component,
  FileText,
  Frame,
  History,
  LayoutDashboardIcon,
  LifeBuoy,
  Link2,
  ListIcon,
  ListMusic,
  Map,
  PieChart,
  PlaySquare,
  Send,
  Upload,
  UserPlus,
} from "lucide-react";
import { UserNav } from "./UserNav";
import MainNav from "./MainNav";
import { useDataStore } from "@/app/DataProvider";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
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
      icon: Component,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: Banknote,
    },
    {
      title: "Activity",
      url: "/activity",
      icon: Activity,
    },

    // Nice-to-have
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart2Icon,
    },
  ],

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

const primary = [
  { title: "Dashboard", url: "/dashboard", icon: Compass },
  { title: "Groups", url: "/groups", icon: Clapperboard },
  { title: "Expenses", url: "/expenses", icon: ListMusic },
  { title: "Activity", url: "/activity", icon: PlaySquare },
  { title: "Shares", url: "/shares", icon: Link2 },
];

const secondary = [{ title: "Settings", url: "/settings", icon: Cog }];
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
        <MainNav primary={primary} secondary={secondary} />
      </SidebarContent>
      <SidebarFooter>
        <UserNav user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
