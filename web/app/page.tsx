import Logo from './components/logo'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.logoContainer}>
      <Logo/>
      </div>
    </main>
  )
}
