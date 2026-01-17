"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success("Account created! Check your email to verify.");
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Logo width={220} height={50} theme="dark" />
                        </div>
                        <p className="text-xl text-white/80 max-w-md">
                            Join thousands of businesses using voice AI to automate customer
                            interactions.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-white/70">Free tier available</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <span className="text-white/70">No credit card required</span>
                        </div>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
            </div>

            {/* Right Panel - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-md border-0 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
                            <Logo width={160} height={36} />
                        </div>
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription>
                            Get started with your free voice AI platform
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignup}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </CardContent>
                    </form>
                    <CardFooter className="flex flex-col space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary underline-offset-4 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                        <p className="text-center text-xs text-muted-foreground">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
