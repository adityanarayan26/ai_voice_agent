import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bot, MessageSquare, Clock, Plus, ArrowRight } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils/date";

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get stats
    const { count: botsCount } = await supabase
        .from("voice_bots")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const { count: conversationsCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const { data: recentConversations } = await supabase
        .from("conversations")
        .select(`
      *,
      voice_bots ( name )
    `)
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(5);

    const { data: recentBots } = await supabase
        .from("voice_bots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {userName}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here&apos;s an overview of your voice AI platform.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Voice Bots
                        </CardTitle>
                        <Bot className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{botsCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active voice agents
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Conversations
                        </CardTitle>
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{conversationsCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total conversations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Status
                        </CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">Active</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                            <Plus className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Create New Bot</h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                            Build a new voice AI agent with custom configuration
                        </p>
                        <Link href="/bots/new">
                            <Button className="cursor-pointer">
                                Create Bot
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Bots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentBots && recentBots.length > 0 ? (
                            <div className="space-y-3">
                                {recentBots.map((bot) => (
                                    <Link
                                        key={bot.id}
                                        href={`/bots/${bot.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{bot.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(bot.created_at)}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No bots created yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Conversations */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Recent Conversations</CardTitle>
                    <Link href="/conversations">
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                            View All
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentConversations && recentConversations.length > 0 ? (
                        <div className="space-y-3">
                            {recentConversations.map((conv) => (
                                <Link
                                    key={conv.id}
                                    href={`/conversations/${conv.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {(conv.voice_bots as { name: string })?.name || "Unknown Bot"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(conv.started_at)}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${conv.status === "active"
                                            ? "bg-green-500/10 text-green-500"
                                            : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {conv.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No conversations yet. Create a bot and start a conversation!
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
