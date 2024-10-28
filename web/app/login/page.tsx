"use client"; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '../components/logo';
import styles from '../login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('login pressed!');

    // Simulate form validation success
    if (email && password) {
      // Reset the redirect flag
      localStorage.setItem('hasRedirected', 'false'); // Allow redirect again
      router.push('/'); // SHOULD Redirect to homepage
    }
  };

  return (
    <div className={styles.main}>
      <Logo />
      <form onSubmit={handleSubmit} className={styles.loginFields}>
        <div className={styles.loginText}>
          <h3>Log in to your account</h3>
        </div>

        <label htmlFor="email" className={styles.labelText}>Email address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className={styles.inputFields}
        />

        <label htmlFor="password" className={styles.labelText}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className={styles.inputFields}
        />

        <button type="submit" className={styles.loginButton}>
          Login
        </button>
      </form>
    </div>
  );
}
