import Link from "next/link";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE, getCartItemCount } from "@/lib/cart";
import { UserMenu } from "./UserMenu";
import { NavbarShell } from "./NavbarShell";

async function loadHeaderState() {
  const session = await auth();
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

  const cartCount = await getCartItemCount({
    userId: session?.user?.id ?? null,
    sessionId: session?.user ? null : guestSessionId,
  });

  return { session, cartCount };
}

export async function Navbar() {
  const { session, cartCount } = await loadHeaderState();

  const userSlot = session?.user ? (
    <UserMenu
      email={session.user.email ?? ""}
      name={session.user.name}
      role={session.user.role}
    />
  ) : (
    <Link
      href="/auth/signin"
      className="hidden text-[11px] uppercase tracking-[0.3em] text-ink/75 transition-colors hover:text-brand-gold sm:inline-block"
    >
      Sign in
    </Link>
  );

  return <NavbarShell cartCount={cartCount} userSlot={userSlot} />;
}
