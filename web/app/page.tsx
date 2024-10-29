"use client";
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie'; 

import Link from 'next/link';
import styles from './homepage.module.css'

export default function Home() {
  useEffect(() => {
    // Check if the redirect cookie exists
    const hasRedirected = Cookies.get('hasRedirected');

    if (!hasRedirected) {
      // Set a cookie to indicate that the redirect has happened
      Cookies.set('hasRedirected', 'true', { expires: (24 * 60 * 60) });
      redirect('/login'); // Redirect to the login page only once
    }
  }, []);

  return (
    <main className={styles.main}>
      {/* Imported Logo since it's going to be the same everywhere*/}
      <div className={styles.videoUploadText}>
          <h2>Click below to upload your
              video after you have recorded it</h2>
      </div>
      
      {/* For the arrow */}
      <div className={styles.arrowContainer}>
        <div className={styles.line}></div>
        <div className={styles.arrow}></div>
      </div>

      {/* Video Upload Button - redirects to video upload page */}
      <div className={styles.videoButtonContainer}>
        <Link href="/homepage">
        <button className={styles.videoUploadButton}>
          Go to Video Upload Page
        </button>
      </Link>
      </div>
    </main>
  );
}
