'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Intro() {
    const router = useRouter();

    return (
        <div className='typewriter text-center'>
            <h1 className='typewriter text-2xl font-bold'>"The universe ought to be a cacophony of voices, but it instead is disconcertingly quiet."</h1>
            <Button onClick={() => router.push('/auth/sign-in')} className='delay-show mt-6'>Add Your Voice</Button>
        </div>
    );
}