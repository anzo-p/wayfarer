import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wayfarer Planner',
  description: 'Plan and share waypoint-based journeys.'
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
