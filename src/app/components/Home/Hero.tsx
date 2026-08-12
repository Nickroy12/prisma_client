import React from 'react'
import Link from 'next/link'

const Hero = () => {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0d0f1a] text-[#e8eaf6] font-sans">
            <h1 className="text-[2rem] font-bold tracking-tight">Welcome to Prisma App</h1>
            <p className="text-[#7c83a0] mb-2">Get started by signing in or creating an account.</p>

        </main>
    );
}

export default Hero