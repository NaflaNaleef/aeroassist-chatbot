"use client";

import { PageBody, PageHeader } from '@kit/ui/page';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Separator } from '@kit/ui/separator';
import {
    MessageCircle,
    Plane,
    Search,
    Calendar,
    MapPin,
    Clock,
    HelpCircle,
    Zap,
    History,
    Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import ChatUI from "../../components/chat-ui";

export default function ChatPage() {
    const router = useRouter();

    const handleQuickAction = (action: string) => {
        // Navigate to the appropriate page
        switch (action) {
            case 'search':
                router.push('/flights/search');
                break;
            case 'bookings':
                router.push('/bookings');
                break;
            case 'status':
                router.push('/flights/status');
                break;
            case 'checkin':
                router.push('/check-in');
                break;
        }
    };

    const handleCommonQuestion = (question: string) => {
        // This would typically trigger a chat message
        // For now, we'll just log it
        console.log('Common question clicked:', question);
    };

    return (
        <>
            <PageHeader
                title="AI Assistant"
                description="Get instant help with flights, bookings, and travel information"
            />

            <PageBody>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Chat Area */}
                    <div className="lg:col-span-3">
                        <Card className="h-[70vh]">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <MessageCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">AeroAssist Chat</CardTitle>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                                    Online
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Powered by AI • Real-time assistance
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm">
                                            <History className="h-4 w-4 mr-1" />
                                            History
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 h-full">
                                <div className="h-full">
                                    <ChatUI />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar with Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center">
                                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    size="sm"
                                    onClick={() => handleQuickAction('search')}
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Search Flights
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    size="sm"
                                    onClick={() => handleQuickAction('bookings')}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    My Bookings
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    size="sm"
                                    onClick={() => handleQuickAction('status')}
                                >
                                    <Plane className="h-4 w-4 mr-2" />
                                    Flight Status
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    size="sm"
                                    onClick={() => handleQuickAction('checkin')}
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Check In
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Common Questions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center">
                                    <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                                    Common Questions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto p-2"
                                    size="sm"
                                    onClick={() => handleCommonQuestion('How do I change my flight?')}
                                >
                                    <div className="text-xs">
                                        <div className="font-medium">How do I change my flight?</div>
                                        <div className="text-muted-foreground">Modify bookings and dates</div>
                                    </div>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto p-2"
                                    size="sm"
                                    onClick={() => handleCommonQuestion('What\'s my baggage allowance?')}
                                >
                                    <div className="text-xs">
                                        <div className="font-medium">What's my baggage allowance?</div>
                                        <div className="text-muted-foreground">Check weight and size limits</div>
                                    </div>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto p-2"
                                    size="sm"
                                    onClick={() => handleCommonQuestion('Flight delayed or cancelled?')}
                                >
                                    <div className="text-xs">
                                        <div className="font-medium">Flight delayed or cancelled?</div>
                                        <div className="text-muted-foreground">Get compensation info</div>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* System Status */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                                    System Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">AI Assistant</span>
                                    <Badge variant="secondary" className="text-xs">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        Online
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Flight Search</span>
                                    <Badge variant="secondary" className="text-xs">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        Online
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Booking System</span>
                                    <Badge variant="secondary" className="text-xs">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        Online
                                    </Badge>
                                </div>
                                <Separator />
                                <div className="text-xs text-muted-foreground">
                                    Last updated: Just now
                                </div>
                            </CardContent>
                        </Card>

                        {/* Help & Support */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Need More Help?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full" size="sm">
                                    Contact Support
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    View FAQ
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    Live Chat
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageBody>
        </>
    );
} 