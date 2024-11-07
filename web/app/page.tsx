// import Logo from './components/logo'
// import styles from './page.module.css'
// import Link from 'next/link'; 

// export default function Home() {
//   return (
//     <main className={styles.main}>
//       <div className={styles.logoContainer}>
//       <Logo/>
//       </div>
//     </main>
//   )
// }
"use client";
import Link from 'next/link';
import Logo from './components/logo'; 
import styles from './homepage.module.css'
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Homepage() {
  useEffect
  var isLoggedIn = false;
  console.log('in root page!');
  console.log('loggedIn val: ' + isLoggedIn);
  if (!isLoggedIn){
    isLoggedIn = true;
    redirect('login');
  }
  return (
    <main className={styles.main}>
      {/* Imported Logo since it's going to be the same everywhere*/}
      <Logo />
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
  
