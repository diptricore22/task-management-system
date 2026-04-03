import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, redirect to dashboard
  // In the future, this could check authentication status
  // and redirect to login if not authenticated
  redirect('/dashboard');
}