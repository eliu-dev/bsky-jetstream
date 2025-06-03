"use client";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Sparkles, RefreshCw, Copy, Send, Clock, Share2, User, Users } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const formSchema = z.object({
  text: z.string().min(1, 'Post cannot be empty').max(300, 'Post must be less than 300 characters'),
});

// Type for saved cringe posts
type CringePost = {
  id: string;
  text: string;
  prompt?: string;
  isPosted: boolean;
  createdAt: string;
};

// Simple function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cringePosts, setCringePosts] = useState<CringePost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postFilter, setPostFilter] = useState<'user' | 'all'>('user');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  // Load Bluesky connection and saved posts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/bluesky/oauth/session');
        setIsConnected(response.data.ok === true);

        if (response.data.ok) {
          // Load saved cringe posts
          fetchCringePosts();
        }
      } catch (error) {
        console.error('Error checking Bluesky connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Fetch saved cringe posts
  const fetchCringePosts = async (filter: 'user' | 'all' = postFilter) => {
    try {
      setLoadingPosts(true);
      console.log("Fetching cringe posts with filter:", filter);
      const response = await axios.get(`/api/bluesky/cringe?filter=${filter}`);
      console.log("Fetch response:", response.data);
      if (response.data.posts) {
        setCringePosts(response.data.posts);
        console.log("Set cringe posts:", response.data.posts.length);
      }
    } catch (error) {
      console.error('Error fetching cringe posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchCringePosts(postFilter);
    }
  }, [postFilter]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/bluesky/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: values.text }),
      });

      const data = await response.json();

      // If the post to Bluesky failed, stop here and show error
      if (!response.ok) {
        console.error("Failed to post to Bluesky:", data.error);
        throw new Error(data.error || 'Failed to post to Bluesky');
      }

      console.log("Successfully posted to Bluesky:", data);

      try {
        const saveResponse = await axios.post('/api/bluesky/cringe', {
          text: values.text,
          prompt: values.text,
          isPosted: true,
          blueskyPostId: data.res?.uri?.split('/').pop() // Extract post ID if available
        });

        console.log("Saved cringe post to database:", saveResponse.data);
      } catch (saveError) {
        console.error("Failed to save post to database:", saveError);
      }

      form.reset();
      fetchCringePosts();

    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to post to Bluesky: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Generate cringe content
  async function generateCringeContent() {
    try {
      setIsGenerating(true);
      const prompt = form.getValues().text || "Generate something cringe";

      // Call the Google Cloud function
      const response = await axios.post('https://bluesky-cringe-generator-895544443438.us-east4.run.app/', {
        prompt: prompt,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Update the text field with the generated content
      if (response.data && response.data.tweet) {
        form.setValue('text', response.data.tweet);
      } else {
        // If the response doesn't have the expected format
        console.error('Unexpected response format:', response.data);
        form.setValue('text', "Sorry, couldn't generate cringe content. Try again!");
      }
    } catch (error) {
      console.error('Error generating cringe content:', error);
      form.setValue('text', "Error generating cringe content. Try again!");
    } finally {
      setIsGenerating(false);
    }
  }

  // Copy post text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Use post in the form
  const usePost = (text: string) => {
    form.setValue('text', text);
  };

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
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
            <CardDescription>Create a new post for Bluesky or generate cringe content</CardDescription>
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
                          placeholder="What's on your mind? Or enter a prompt to generate content..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCringeContent}
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Cringe'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Posting...' : 'Post to Bluesky'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Saved Cringe Posts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Bluesky Cringe Posts</CardTitle>
                <CardDescription>Your posted LinkedIn-style cringe content</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={postFilter === 'user' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPostFilter('user')}
                ><User />
                  My Posts
                </Button>
                <Button
                  variant={postFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPostFilter('all')}
                ><Users />
                  All Posts
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPosts ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : cringePosts.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
                <p>You haven't posted any cringe content yet.</p>
                <p>Generate some cringe content and post it to Bluesky!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cringePosts.map((post) => (
                  <Card key={post.id} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <p className="whitespace-pre-wrap">{post.text}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(post.text)}
                          className="h-7 px-2"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => usePost(post.text)}
                          className="h-7 px-2"
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
