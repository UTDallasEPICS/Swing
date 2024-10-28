"use client";
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function Home() {
  useEffect(() => {
    // Reset the redirect flag each time the app starts
    localStorage.removeItem('hasRedirected');

    // Check if the redirect has already happened
    const hasRedirected = localStorage.getItem('hasRedirected');

    if (!hasRedirected) {
      // Set a flag to indicate the redirect has happened
      localStorage.setItem('hasRedirected', 'true');
      redirect('/login'); // Redirect to the login page only once
    }
  }, []);

  return null; 
}
