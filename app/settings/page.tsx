'use client';

import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useState, useEffect } from 'react';

const formSchema = z.object({
  handle: z.string(),
});

export function BlueskyOAuthLoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: '',
    },
  });

  const startOAuthFlow = async () => {
    try {
      window.location.href = '/api/bluesky/oauth/login';
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <Input disabled type='text' value={'bsky_dev'} className='w-80' />
      <Button onClick={startOAuthFlow}>Connect to Bluesky</Button>
    </div>
  );
}

export default function Settings() {
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Check if we have a profile in query params (returned from OAuth flow)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // You could add an endpoint to check auth status
        const response = await axios.get('/api/bluesky/oauth/session');
        if (response.data.ok && response.data.profile) {
          setIsConnected(true);
          setProfile(response.data.profile);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <div className='flex flex-col gap-6 p-4'>
      <h1 className='text-2xl font-bold'>Bluesky Connection</h1>

      {isConnected ? (
        <div className='flex flex-col gap-2'>
          <div className='text-green-600 font-medium'>✓ Connected to Bluesky</div>
          {profile && (
            <div className='flex items-center gap-2'>
              <div className='font-medium'>Account:</div>
              <div>@{profile.handle}</div>
            </div>
          )}
          <Button
            variant="destructive"
            onClick={async () => {
              await axios.post('/api/bluesky/oauth/session/logout');
              setIsConnected(false);
              setProfile(null);
            }}
            className='w-fit'
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <BlueskyOAuthLoginForm />
      )}
    </div>
  );
}
