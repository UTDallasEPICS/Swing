import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link'; 
import Logo from './components/logo'; 

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.logoContainer}> 
        <Logo /> 
        </div>
        
        {/* <Link href="/about">
        <button className={styles.button}>
          Go to Home Page
        </button>
      </Link> */}

    </main>
  )
}
