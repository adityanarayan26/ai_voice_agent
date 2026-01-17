"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ArrowRight, Play } from "lucide-react";

export const Component = () => {
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState(false);

  return (
    <div className={cn("flex flex-col items-center gap-4 w-full rounded-lg min-h-screen bg-black")}>
      <div className="w-full">
        <header className="py-4 bg-black/50 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10 sm:py-6 transition-all duration-300">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="shrink-0">
                <Link href="/" title="" className="flex">
                  <Logo width={160} height={30} className="invert" />
                </Link>
              </div>

              <div className="flex md:hidden">
                <button
                  type="button"
                  className="text-white"
                  onClick={() => setMobileMenuExpanded(!mobileMenuExpanded)}
                >
                  {!mobileMenuExpanded ? (
                    <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>

              <nav className="hidden md:flex md:items-center md:justify-end md:space-x-12">
                <Link href="/login" className="text-base font-medium text-gray-400 transition-all duration-200 hover:text-white">
                  Sign In
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full px-6 bg-white text-black hover:bg-gray-200 font-semibold" size="default">
                    Get Started
                  </Button>
                </Link>
              </nav>
            </div>

            {mobileMenuExpanded && (
              <nav className="md:hidden">
                <div className="flex flex-col pt-8 pb-4 space-y-6">
                  <Link href="/login" className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white">
                    Sign In
                  </Link>
                  <Link href="/signup" className="text-base font-normal text-white transition-all duration-200 hover:text-gray-300">
                    Get Started
                  </Link>
                </div>
              </nav>
            )}
          </div>
        </header>

        <section className="py-12 bg-black sm:pb-16 lg:pb-20 xl:pb-24 pt-32 h-screen flex items-center">
          <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl w-full">
            <div className="relative">
              <div className="lg:w-2/3 relative z-10">
                <p className="text-sm pt-12 font-normal tracking-widest text-gray-300 uppercase">Powered by Deepgram & Gemini AI</p>
                <h1 className="mt-6 text-4xl font-normal text-white sm:mt-10 sm:text-5xl lg:text-6xl xl:text-8xl">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">Intelligent Voice</span> Agents
                </h1>
                <p className="max-w-lg mt-4 text-xl font-normal text-gray-400 sm:mt-8">
                  Build sophisticated conversational AI in minutes. No coding required. Deploy voice agents for support, sales, and more.
                </p>
                <div className="relative inline-flex items-center justify-center mt-8 sm:mt-12 group">
                  <div className="absolute transition-all duration-200 rounded-full -inset-px bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:shadow-lg group-hover:shadow-cyan-500/50"></div>
                  <Link href="/signup" className="relative inline-flex items-center justify-center px-8 py-3 text-base font-normal text-white bg-black border border-transparent rounded-full" role="button">
                    Start Building Free
                  </Link>
                </div>

                <div>
                  <div className="inline-flex items-center pt-6 mt-8 border-t border-gray-800 sm:pt-10 sm:mt-14">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 7.00003H21M21 7.00003V15M21 7.00003L13 15L9 11L3 17" stroke="url(#a)" strokeLinecap="round" strokeLinejoin="round" />
                      <defs>
                        <linearGradient id="a" x1="3" y1="7.00003" x2="22.2956" y2="12.0274" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" style={{ stopColor: 'rgb(6 182 212)' }} />
                          <stop offset="100%" style={{ stopColor: 'rgb(168 85 247)' }} />
                        </linearGradient>
                      </defs>
                    </svg>

                    <span className="ml-2 text-base font-normal text-white">Processing 10k+ conversations daily</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 md:absolute md:mt-0 md:top-48 lg:top-12 md:right-0 pointer-events-none">
                <img className="w-full max-w-xs mx-auto lg:max-w-lg xl:max-w-xl" src="https://landingfoliocom.imgix.net/store/collection/dusk/images/hero/1/3d-illustration.png" alt="" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};