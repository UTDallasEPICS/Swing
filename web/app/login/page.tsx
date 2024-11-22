"use client"; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Logo from '../components/logo'; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('login pressed!');

    // Simulate form validation success
    if (email && password) {
      // Reset the redirect flag in a cookie with a short expiry
      Cookies.set('hasRedirected', 'false', { expires: 24 * 60 * 60 });
      router.push('/'); // Redirect to homepage
    }
  };

  return (
    <div className="flex flex-col items-center p-12 min-h-screen bg-white">
      <Logo />
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center text-center pt-12 pb-12">
        <div className="text-black flex justify-center items-center text-center pb-12">
          {/* Form fields (e.g., email, password) */}
          <h3>Log in to your account</h3>
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
        </div>
      </form>
    </div>
  );
}
