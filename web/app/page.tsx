import Logo from './components/logo';
import styles from './page.module.css';
import Link from 'next/link'; 

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.logoContainer}>
      <Logo/>
      </div>
    </main>
  )
}
