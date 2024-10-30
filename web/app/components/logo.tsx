import Image from 'next/image';
import styles from '../page.module.css';

export default function Logo({ className }: { className?: string }) {
  {/* Accepts the className as a prop */}
  return (
    <div className={`${styles.logoContainer} ${className}`}>
      <Image
        className={`${styles.logo} max-w-full h-auto`} 
        src="/image2vector.svg"
        alt="Swing Logo"
        width={500}
        height={150}
        priority
      />
    </div>
  );
}
