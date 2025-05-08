'use client';

import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    handle: z.string(),
});

export function BlueskyOAuthLoginForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            handle: '',
        },
    });

    const startOAuthFlow = async () => {
        try {
            router.push('/api/bluesky/oauth/login')
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