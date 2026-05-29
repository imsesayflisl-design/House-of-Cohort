"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Boxes,
  Percent,
  Truck,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import type { Role } from "@/generated/prisma/enums";

type NavLink = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Discounts", href: "/admin/discounts", icon: Percent, adminOnly: true },
  { label: "Delivery Zones", href: "/admin/delivery", icon: Truck },
  { label: "Staff", href: "/admin/staff", icon: Users, adminOnly: true },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const links = NAV_LINKS.filter((l) => !l.adminOnly || role === "ADMIN");

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {links.map(({ label, href, icon: Icon }) => {
        const active = isLinkActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm tracking-wide transition-colors",
              active
                ? "bg-brand-gold/15 text-brand-gold border-l-2 border-brand-gold"
                : "text-brand-white/70 hover:bg-brand-white/5 hover:text-brand-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <div className="px-6 py-6 border-b border-brand-gold/20">
      <Link href="/admin" className="font-serif text-2xl text-brand-gold">
        House of Cohort
      </Link>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-white/40">
        Admin
      </p>
    </div>
  );
}

function SidebarFooter({ email, role }: { email: string; role: Role }) {
  return (
    <div className="border-t border-brand-gold/20 px-4 py-4">
      <div className="mb-3 text-xs text-brand-white/60">
        <p className="truncate text-brand-white/90">{email}</p>
        <p className="uppercase tracking-widest text-brand-gold/80">{role}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full bg-transparent border-brand-gold/40 text-brand-white hover:bg-brand-gold/10 hover:text-brand-gold"
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}

export function AdminSidebar({
  role,
  userEmail,
}: {
  role: Role;
  userEmail: string;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-brand-black md:text-brand-white md:border-r md:border-brand-gold/20">
        <SidebarHeader />
        <NavList role={role} />
        <SidebarFooter email={userEmail} role={role} />
      </aside>

      {/* Mobile trigger */}
      <div className="md:hidden flex items-center justify-between border-b border-brand-gold/20 bg-brand-black px-4 py-3 text-brand-white">
        <Link href="/admin" className="font-serif text-lg text-brand-gold">
          House of Cohort
        </Link>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-brand-gold/40 text-brand-white hover:bg-brand-gold/10"
              />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 bg-brand-black text-brand-white border-brand-gold/20 p-0 flex flex-col"
          >
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <SidebarHeader />
            <NavList role={role} />
            <SidebarFooter email={userEmail} role={role} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
