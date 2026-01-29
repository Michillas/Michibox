'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function EmailVerificationStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, []);

  const handleResend = async () => {
    if (!user?.email) return;

    setSending(true);
    setMessage('');

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: window.location.origin + '/',
      });

      if (error) throw error;

      setMessage('Verification email sent! Check your inbox.');
    } catch (error: any) {
      setMessage(error?.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (user.emailVerified) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Your email address is verified
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <div>
          <p className="font-medium">Email not verified</p>
          <p className="text-sm mt-1">
            Please verify your email address to access all features.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={sending}
            className="w-fit"
          >
            {sending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          
          {message && (
            <p className="text-sm">{message}</p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
