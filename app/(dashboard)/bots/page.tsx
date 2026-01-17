import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bot, Plus, ArrowRight, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

export default async function BotsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: bots } = await supabase
        .from("voice_bots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Voice Bots</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your voice AI agents
                    </p>
                </div>
                <Link href="/bots/new">
                    <Button className="cursor-pointer gap-2">
                        <Plus className="w-4 h-4" />
                        Create New Bot
                    </Button>
                </Link>
            </div>

            {/* Bots Grid */}
            {bots && bots.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bots.map((bot) => (
                        <Card key={bot.id} className="group hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                                        <Bot className="w-6 h-6 text-primary" />
                                    </div>
                                    <Link href={`/bots/${bot.id}/edit`}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{bot.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {bot.system_prompt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(bot.created_at)}
                                    </span>
                                    <Link href={`/bots/${bot.id}`}>
                                        <Button variant="outline" size="sm" className="cursor-pointer gap-1">
                                            Open
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                            <Bot className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No voice bots yet</h3>
                        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                            Create your first voice AI agent to start having conversations
                        </p>
                        <Link href="/bots/new">
                            <Button className="cursor-pointer gap-2">
                                <Plus className="w-4 h-4" />
                                Create Your First Bot
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
