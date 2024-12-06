'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface SignUpFormProps {
  onClose: () => void;
}

export function SignUpForm({ onClose }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isLoaded, signUp } = useSignUp();

  if (!isLoaded) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Start the sign-up process
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      // Wait for the sign-up process to complete
      await result.prepareEmailAddressVerification();
      
      // Handle successful sign-up
      onClose();
    } catch (err: any) {
      console.error('Error during sign up:', err);
      setError(err.errors?.[0]?.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-6 bg-[#0a0a0a] rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1a1a1a] border-[#333] text-white"
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1a1a1a] border-[#333] text-white"
            required
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
    </div>
  );
}
