'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

interface EmailVerificationProps {
  email: string;
  onVerified?: () => void;
  onBack?: () => void;
}

export function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      });

      if (verifyError) throw verifyError;

      // Check if auto-sign-in is enabled (default behavior)
      if (data?.user) {
        setMessage('Email verified! Signing you in...');
        setTimeout(() => {
          onVerified?.();
        }, 1000);
      } else {
        setMessage('Email verified! You can now sign in.');
        setTimeout(() => {
          onBack?.();
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resendError } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + '/',
      });

      if (resendError) throw resendError;

      setMessage('Verification email sent! Check your inbox.');
    } catch (err: any) {
      setError(err?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="p-6 space-y-4">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-sm text-muted-foreground">
            Enter the verification code sent to
          </p>
          <p className="text-sm font-medium">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          {message && (
            <Alert>
              <p className="text-sm">{message}</p>
            </Alert>
          )}

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={loading}
            >
              Resend Code
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBack}
                disabled={loading}
              >
                Back to Sign In
              </Button>
            )}
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Verification codes expire after 15 minutes
        </p>
      </Card>
    </div>
  );
}
