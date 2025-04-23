'use client';

import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
}

export default function Settings() {
  return (
    <div className='flex items-center gap-2'>
      <h1>Test</h1>
      <h1>Test 2</h1>
      <Input disabled type='text' value={'bsky_dev'} />
    </div>
  );
}
