"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
};

export function MainNav({
  primary,
  secondary,
}: {
  primary: NavItem[];
  secondary?: NavItem[];
}) {
  const pathname = usePathname();

  const isActive = (url: string) => {
    // exact match + "startsWith" for nested routes
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(url + "/");
  };

  return (
    <SidebarGroup className="px-0">
      <SidebarMenu className="gap-1">
        {primary.map((item) => {
          const active = isActive(item.url);
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                  // row layout
                  "group h-auto w-full justify-start gap-3 px-4 py-2.5",
                  // match screenshot: full-width highlight, not pill
                  "rounded-none",
                  // text + hover
                  active
                    ? "bg-muted/60 text-foreground font-semibold"
                    : "text-foreground/80 hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Link href={item.url} aria-current={active ? "page" : undefined}>
                  {/* icon bubble */}
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="size-5" />
                  </span>

                  {/* label */}
                  <span className="text-[15px] leading-none">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>

      {secondary?.length ? (
        <>
          <div className="my-4 border-t" />
          <SidebarMenu className="gap-1">
            {secondary.map((item) => {
              const active = isActive(item.url);
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "group h-auto w-full justify-start gap-3 px-4 py-2.5 rounded-none",
                      active
                        ? "bg-muted/60 text-foreground font-semibold"
                        : "text-foreground/80 hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <Link href={item.url} aria-current={active ? "page" : undefined}>
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="text-[15px] leading-none">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </>
      ) : null}
    </SidebarGroup>
  );
}

export default MainNav;
