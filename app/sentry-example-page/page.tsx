"use client";

import { Button } from '@/components/ui/button';

export default function SentryExamplePage() {
  const triggerError = () => {
    throw new Error('Sentry Test Error');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold">Sentry Integration Test</h1>
      <p className="text-gray-600 max-w-md text-center">
        This page is for testing Sentry error reporting. Click the button below to trigger a test error that will be captured by Sentry.
      </p>
      <Button 
        onClick={triggerError}
        className="bg-red-500 hover:bg-red-600"
      >
        Trigger Test Error
      </Button>
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: Only use this page for testing purposes.</p>
      </div>
    </div>
  );
}