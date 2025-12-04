import Image from "next/image";
import styles from "../page.module.css";

export default function Logo({ className }: { className?: string }) {
  {
    /* Accepts the className as a prop */
  }
  return <div className={`${styles.logoContainer} ${className}`}></div>;
}
