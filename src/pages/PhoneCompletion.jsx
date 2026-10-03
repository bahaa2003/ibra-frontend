import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/useAuthStore';
import { validatePhone } from '../utils/validation';
import { getDefaultRouteForRole } from '../utils/authRoles';

const PhoneCompletion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isGoogleMode = new URLSearchParams(location.search).get('mode') === 'google';
  const {
    user,
    isAuthenticated,
    isLoading,
    googleProfileCompletionToken,
    completePhone,
    completeGooglePhone,
  } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const needsCompletion = user?.profileCompletionRequired === true;

  useEffect(() => {
    if (isAuthenticated && !needsCompletion) {
      navigate(getDefaultRouteForRole(user?.role), { replace: true });
    }
  }, [isAuthenticated, navigate, needsCompletion, user?.role]);

  if (isGoogleMode && !googleProfileCompletionToken) {
    return <Navigate to="/auth" replace />;
  }
  if (!isGoogleMode && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validatePhone(phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    const result = isGoogleMode
      ? await completeGooglePhone(phone)
      : await completePhone(phone);

    if (!result?.ok) {
      setError(result?.error || 'Unable to save your phone number.');
      return;
    }

    navigate(result.redirectTo || getDefaultRouteForRole(result.user?.role), { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:rgb(var(--color-surface-rgb)/0.92)] px-4 py-8">
      <Card className="w-full max-w-md space-y-5 p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]">
          <Phone className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Add your phone number</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            A phone number is required before you can use customer services. It is not used for SMS verification.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone number"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="+20 101 234 5678"
            error={error}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            <ShieldCheck className="h-4 w-4" />
            {isLoading ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default PhoneCompletion;
