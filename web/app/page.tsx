import Image from 'next/image'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.logoContainer}>
        <Image
          className={styles.logo}
          src="/swingLogo.svg"
          alt="Next.js Logo"
          width={500}
          height={150}
          priority
        />
        </div>
    </main>
  )
}
