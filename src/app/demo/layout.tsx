import { Suspense } from 'react';

// Force dynamic rendering for all demo pages
export const dynamic = 'force-dynamic';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
