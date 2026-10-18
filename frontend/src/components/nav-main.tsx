"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIThemeStore, renderSidebarIcon } from "@/store/ui-theme.store";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

function NavSubItem({ subItem, pathname }: { subItem: any; pathname: string }) {
  const isActive = (url: string) =>
    Boolean(url && url !== "#" && (pathname === url || pathname.startsWith(url + "/")));

  const subActive = isActive(subItem.url);
  const [subOpen, setSubOpen] = useState(false);

  if (subItem.items) {
    return (
      <div className="group">
        <SidebarMenuButton
          type="button"
          onClick={() => setSubOpen((prev) => !prev)}
          className="group h-8 min-h-8 pl-6 cursor-pointer"
        >
          <span>{subItem.title}</span>
          <ChevronRight
            className={cn(
              "ml-auto h-4 w-4 transition-transform duration-200",
              subOpen && "rotate-90"
            )}
          />
        </SidebarMenuButton>
        {subOpen && (
          <SidebarMenuSub>
            {subItem.items.map((child: any) => (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(child.url)}
                  className="h-8 min-h-8 pl-6"
                >
                  <Link href={child.url}>{child.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </div>
    );
  }

  return (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuButton asChild isActive={subActive} className="h-8 min-h-8 pl-6">
        <Link href={subItem.url}>{subItem.title}</Link>
      </SidebarMenuButton>
    </SidebarMenuSubItem>
  );
}

// Helper component that encapsulates per‑item state and effects without Radix ID hydration mismatch
function NavItem({ item, pathname }: { item: any; pathname: string }) {
  const isActive = (url: string) =>
    Boolean(url && url !== "#" && (pathname === url || pathname.startsWith(url + "/")));

  const isParentActive = (itm: any): boolean => {
    if (!itm.items) return false;
    return itm.items.some((sub: any) => {
      if (sub.items) {
        return sub.items.some((child: any) => isActive(child.url));
      }
      return isActive(sub.url);
    });
  };

  const parentActive = isParentActive(item);
  const [open, setOpen] = useState(Boolean(item.defaultOpen || parentActive));
  const { sidebarIconColor } = useUIThemeStore();

  // Sync open state when the active route changes
  useEffect(() => {
    setOpen(parentActive);
  }, [parentActive]);

  if (item.items) {
    return (
      <SidebarMenuItem className="group">
        <SidebarMenuButton
          type="button"
          className="group cursor-pointer"
          isActive={parentActive}
          onClick={() => setOpen((prev) => !prev)}
        >
          {renderSidebarIcon(item.icon, sidebarIconColor)}
          <span>{item.title}</span>
          <ChevronRight
            className={cn(
              "ml-auto h-4 w-4 transition-transform duration-200",
              open && "rotate-90"
            )}
          />
        </SidebarMenuButton>

        {open && (
          <SidebarMenuSub className="space-y-0.5">
            {item.items.map((subItem: any) => (
              <NavSubItem
                key={subItem.title}
                subItem={subItem}
                pathname={pathname}
              />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  // Leaf navigation item (no children)
  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild isActive={isActive(item.url)}>
        <Link href={item.url}>
          {renderSidebarIcon(item.icon, sidebarIconColor)}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({ items }: { items: any[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu className="space-y-1">
      {items.map((item) => (
        <NavItem key={item.title} item={item} pathname={pathname} />
      ))}
    </SidebarMenu>
  );
}