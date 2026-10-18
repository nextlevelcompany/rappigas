"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIThemeStore, renderSidebarIcon } from "@/store/ui-theme.store";

function PlainNavItem({ section, pathname }: { section: any; pathname: string }) {
  const { sidebarIconColor } = useUIThemeStore();
  const isDefaultOpen = section.items?.some(
    (item: any) => pathname === item.url || pathname.startsWith(item.url + "/")
  );
  const [open, setOpen] = useState(Boolean(isDefaultOpen));

  return (
    <div className="w-full">
      {/* Header – clickable to expand/collapse */}
      <SidebarMenuButton
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full justify-start gap-2 cursor-pointer",
          open && "bg-muted"
        )}
      >
        {renderSidebarIcon(section.icon, sidebarIconColor) ?? null}
        <span>{section.title}</span>
        <ChevronRight
          className={cn(
            "ml-auto h-4 w-4 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </SidebarMenuButton>

      {/* Content – list of inner links */}
      {open && (
        <div className="ml-4 mt-1 space-y-0.5">
          {section.items?.map((item: any) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={
                  pathname === item.url || pathname.startsWith(item.url + "/")
                    ? "bg-primary/10 text-primary-foreground font-medium"
                    : ""
                }
              >
                <Link href={item.url} className="flex items-center gap-2">
                  {renderSidebarIcon(item.icon, sidebarIconColor) ?? null}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Collapsible navigation for Super‑Admin.
 * Each top‑level section is a collapsible panel that shows its icon and title.
 */
export function NavPlain({ items }: { items: any[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu className="px-3 py-2">
      {items.map((section) => (
        <PlainNavItem key={section.title} section={section} pathname={pathname} />
      ))}
    </SidebarMenu>
  );
}
