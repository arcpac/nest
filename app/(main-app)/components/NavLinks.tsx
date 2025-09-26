"use client";

import clsx from "clsx";
import { FileText, HomeIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  {
    name: "Groups",
    href: "/groups",
    icon: FileText,
  },
  { name: "Members", href: "/members", icon: UsersIcon },
];

export default function NavLinks({ collapse }: { collapse: Boolean }) {
  const pathname = usePathname();
  const segmentName = pathname.split("/").pop();

  return (
    <>
      {links.map((link) => {
        const activeLink = link.href.split("/").pop();
        const LinkIcon = link.icon;
        const isActive = segmentName === activeLink;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": isActive,
              }
            )}
          >
            <LinkIcon className="w-6" />
            {!collapse && <p className="hidden md:block">{link.name}</p>}
          </Link>
        );
      })}
    </>
  );
}
