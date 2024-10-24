"use client"; // make this a Client Component (allowing interactivity)

import Logo from '../components/logo'
import styles from '../login.module.css'
// import {useState} from 'react'

export default function LoginPage() {
  // Store user data
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('login pressed!');
    // Will implement page rerouting here
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