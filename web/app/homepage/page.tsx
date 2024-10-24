import Link from 'next/link';
import Logo from '../components/logo'; 
import styles from '../homepage.module.css'

export default function Homepage() {
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
  