import { Suspense } from "react";

// The auth pages (signin / signout / signup) are client components that read
// useSearchParams(). Next requires a Suspense boundary above any client
// component using useSearchParams or it fails static prerendering with a
// "missing-suspense-with-csr-bailout" error. Wrapping the group here provides
// that boundary for all auth routes at once.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
