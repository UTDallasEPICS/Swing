"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { Magic } from 'magic-sdk';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const magic = new Magic('pk_live_21D11BC81024D112');

  const handleMagicLogin = async () => {
    setLoading(true);
    try {
      await magic.auth.loginWithMagicLink({ email });
      Cookies.set('hasRedirected', 'false', { expires: 24 * 60 * 60 });
      router.push('/'); // Redirect to homepage
    } catch (error) {
      console.error('Magic Link login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login pressed!');

    if (email) {
      await handleMagicLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md bg-gray-100 rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome</h3>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="email" className="text-gray-700 font-medium mb-2">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-semibold shadow-md transition duration-300"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login with Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
