"use client"; // make this a Client Component (allowing interactivity)

import Logo from '../components/logo'
import styles from '../login.module.css'
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
// import {useState} from 'react'

export default function LoginPage() {
  // Store user data
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const router = useRouter();
  // Handle form submission
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
          <h3>Log in to your account</h3>
        </div>

        <label htmlFor="email" className="w-full text-left p-1">Email address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Enter your email"
          className="text-black mb-8 p-4 rounded-lg border border-black w-80 shadow-lg"
        />

        <label htmlFor="password" className="w-full text-left p-1">Password</label>
        <input
          type="password"
          id="password"
          name="password"
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