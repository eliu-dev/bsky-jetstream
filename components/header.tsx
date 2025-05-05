'use client';

import { UserButton } from '@daveyplate/better-auth-ui';
import Link from 'next/link';
import { useSession } from '@/hooks/auth-hooks';

import { ModeToggle } from './mode-toggle';

export function Header() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return (
    <header className='sticky top-0 z-50 border-b bg-background/60 px-4 py-3 backdrop-blur'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-6'>
          <Link href='/'>Bluesky Jetstream</Link>
          {isAuthenticated && (
            <>
              <Link href='/dashboard'>Dashboard</Link>
              <Link href='/settings'>Settings</Link>
            </>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
