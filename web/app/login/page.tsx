"use client"; // Ensure this is a client component
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../login.module.css'; // Adjust your CSS import as needed
import Logo from '../components/logo'; // Your logo component

export default function LoginPage() {
  const router = useRouter(); // Initialize the router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('login pressed!');
    
    // Implement page rerouting
    router.push('/'); // SHOULD Redirect to the homepage
  };

  return (
    <div className={styles.main}>
      <Logo/>
      <form onSubmit={handleSubmit} className={styles.loginFields}>
        <div className={styles.loginText}>
          <h3>Log in to your account</h3>
        </div>

        <label htmlFor="email" className={styles.labelText}>Email address</label>
        <input
          type="email"
          id="email"
          name="email"
          // value={email}
          // onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className={styles.inputFields}
        />

        <label htmlFor="password" className={styles.labelText}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          // value={password}
          // onChange={(e) => setPassword(e.target.value)}
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
