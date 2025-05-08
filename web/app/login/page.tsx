"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { Magic } from 'magic-sdk';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const magic = new Magic('pk_live_21D11BC81024D112');

  const handleMagicLogin = async () => {
    setLoading(true);
    try {
      await magic.auth.loginWithMagicLink({ email });
      Cookies.set('hasRedirected', 'false', { expires: 24 * 60 * 60 });
      router.push('/');
    } catch (error) {
      console.error('Magic Link login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      await handleMagicLogin();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section: Logo + Form */}
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-200">
  <div className="w-full md:w-1/2 flex flex-col justify-center items-start p-10 space-y-8">
    {/* Logo */}

    {/* Form Card */}
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome</h3>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="email" className="text-gray-700 font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        />
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 font-semibold shadow-md transition duration-300"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login with Magic Link'}
        </button>
      </form>
    </div>
  </div>
</div>


    {/* Right Side: Image Section */}
<div className="w-full min-h-screen flex items-center justify-center bg-white">
  <Image
    className="max-w-full h-auto"
    src="/image2vector.svg"
    alt="Swing Logo"
    width={500}
    height={150}
    priority
  />
</div>

    </div>
  );
}
