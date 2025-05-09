'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { BlueskyOAuthLoginForm } from '@/components/BlueskyOAuthLoginForm';

const formSchema = z.object({
  handle: z.string(),
});

export default function Settings() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Check if we have a profile in query params (returned from OAuth flow)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/bluesky/oauth/session');
        setConnectionChecked(true);
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
    <div className='flex justify-center items-center flex-col gap-6 p-4'>
      <h1 className='text-2xl font-bold'>Bluesky Connection</h1>
      {
        connectionChecked ? (

          isConnected ? (
            <div className='flex flex-col gap-2' >
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
          )
        ) : (
          <>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-8 w-[250px]" />
          </>
        )
      }
    </div >
  );
}
