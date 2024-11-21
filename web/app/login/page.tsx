"use client"; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const isLoggedIn = true;
    e.preventDefault();
    console.log('login pressed!');
    // Will implement page rerouting here
    router.push('/');
    
  };
  return (
    <div className="flex flex-col items-center p-12 min-h-screen bg-white">
      <Logo />
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center text-center pt-12 pb-12">
        
        <div className="text-black flex justify-center items-center text-center pb-12">

    // Simulate form validation success
    if (email && password) {
      // Reset the redirect flag in a cookie with a short expiry
      // use a token 
      Cookies.set('hasRedirected', 'false', { expires: (24 * 60 * 60) }); // Expires in 15 seconds
      router.push('/'); // Redirect to homepage
    }
  };

  return (
    <div className={styles.main}>
      <form onSubmit={handleSubmit} className={styles.loginFields}>
        <div className={styles.loginText}>
          <h3>Log in to your account</h3>
        </div>
        <label htmlFor="email" className="w-full text-left p-1">Email address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="text-black mb-8 p-4 rounded-lg border border-black w-80 shadow-lg"
        />

        <label htmlFor="password" className="w-full text-left p-1">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          className="text-black mb-8 p-4 rounded-lg border border-black w-80 shadow-lg"
        />

        <button type="submit" className="text-black mt-12 p-4 rounded-lg border border-black w-80 shadow-lg bg-red-700">
          Login
        </button>
      </form>
    </div>
  );
}
