import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login'); // Replace with the desired route path
  return null;
}