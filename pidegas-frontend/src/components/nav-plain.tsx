"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

/**
 * Collapsible navigation for Super‑Admin.
 * Each top‑level section (e.g., Super Admin, Supervisión Operativa) is a collapsible
 * panel that shows its icon and title. Inside the panel the inner items are rendered
 * as a flat list with active‑state highlighting.
 */
export function NavPlain({ items }: { items: any[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu className="px-3 py-2">
      {items.map((section) => (
        <Collapsible key={section.title} className="group w-full" defaultOpen={section.items?.some((item:any)=> pathname===item.url || pathname.startsWith(item.url + "/"))}>
          <div>
            {/* Header – clickable to expand/collapse */}
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-start gap-2 group-data-[state=open]:bg-muted">
                {section.icon ?? null}
                <span>{section.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            {/* Content – list of inner links */}
            <CollapsibleContent className="ml-4 mt-1">
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
                      {item.icon ?? null}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </SidebarMenu>
  );
}
