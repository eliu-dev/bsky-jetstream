"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const formSchema = z.object({
  text: z.string().min(1, 'Post cannot be empty').max(300, 'Post must be less than 300 characters'),
});

export default function Dashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/bluesky/oauth/session');
        setIsConnected(response.data.ok === true);
      } catch (error) {
        console.error('Error checking Bluesky connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/bluesky/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: values.text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to post');
      form.reset();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Checking Bluesky connection...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="default" className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertTitle>Bluesky account not connected</AlertTitle>
          <AlertDescription>
            You need to connect your Bluesky account before you can post messages.
            <div className="mt-2">
              <Button variant="outline" asChild size="sm">
                <Link href="/settings">Connect Account</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What's on your mind?"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
