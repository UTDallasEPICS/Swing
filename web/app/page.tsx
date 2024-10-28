"use client";
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie'; 

export default function Home() {
  useEffect(() => {
    // Check if the redirect cookie exists
    const hasRedirected = Cookies.get('hasRedirected');

    if (!hasRedirected) {
      // Set a cookie to indicate that the redirect has happened
      Cookies.set('hasRedirected', 'true', { expires: 15 / (24 * 60 * 60) });
      redirect('/login'); // Redirect to the login page only once
    }
  }, []);

  return null;
}
