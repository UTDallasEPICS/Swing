import Image from 'next/image';
import styles from '../page.module.css'

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
      <Image
        className={styles.logo}
        src="/swingLogo.svg"
        alt="Swing Logo"
        width={500}
        height={150}
        priority
      />
    </div>
  );
}