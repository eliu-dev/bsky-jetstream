import { UserButton } from '@daveyplate/better-auth-ui';
import Link from 'next/link';

import { ModeToggle } from './mode-toggle';

export function Header() {
  return (
    <header className='sticky top-0 z-50 border-b bg-background/60 px-4 py-3 backdrop-blur'>
      <div className='container mx-auto flex items-center justify-between'>
        <Link href='/'>Bluesky Jetstream</Link>
        <Link href='/dashboard'>Dashboard</Link>
        <Link href='/settings'>Settings</Link>

        <div className='flex items-center gap-2'>
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
