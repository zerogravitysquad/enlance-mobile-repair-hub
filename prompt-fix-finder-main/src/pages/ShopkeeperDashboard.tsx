import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  MessageSquare,
  Smartphone,
  Clock,
  MapPin,
  User,
  Settings,
  Bell,
  Eye,
  Send,
  Store,
  Star,
  CheckCircle2,
  Wrench,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentShop,
  getRequestsByCityAndArea,
  getShopChatRooms,
  requestChat,
  sendMessage,
  subscribeToUpdates,
  RepairRequest,
  ChatRoom,
} from "@/lib/chatService";
import { shopAPI, chatAPI } from "@/lib/api";

const ShopkeeperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [quotationInput, setQuotationInput] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [activeTab, setActiveTab] = useState("requests");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const currentShop = getCurrentShop();

  // Load data and subscribe to updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('enlance_token');
        if (!token) return;

        const city = currentShop.city || "Coimbatore";
        const area = currentShop.area || "RS Puram";

        // Fetch real requests from backend
        const fetchedRequests = await shopAPI.getRequests(city, token);
        const mappedRequests = (fetchedRequests.data || []).map((req: any) => ({
          ...req,
          issue: req.description,
          image: req.imagePath
            ? (req.imagePath.startsWith('http')
              ? req.imagePath
              : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}/${req.imagePath.replace(/\\/g, '/')}`)
            : null,
          time: new Date(req.createdAt).toLocaleDateString() + ' ' + new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        // Filter by area on frontend if the backend doesn't support area-level filtering yet
        const areaRequests = mappedRequests.filter((r: any) =>
          !area || r.area?.toLowerCase() === area.toLowerCase()
        );
        setRequests(areaRequests);

        // Fetch real chat rooms
        const fetchedRooms = await chatAPI.getRooms(token);
        const rooms: ChatRoom[] = fetchedRooms.data || [];
        setChatRooms(rooms);

        // Compute unread counts: messages from user (sender!=='shop') after last-read timestamp
        const lastReads: Record<string, number> = JSON.parse(localStorage.getItem('enlance_shop_last_reads') || '{}');
        const counts: Record<string, number> = {};
        for (const room of rooms) {
          const lastRead = lastReads[room.id] || 0;
          const msgs = (room as any).messages || [];
          counts[room.id] = msgs.filter(
            (m: any) => m.sender === 'user' && new Date(m.createdAt).getTime() > lastRead
          ).length;
        }
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
    // Refresh every 30 seconds or on data update event
    const interval = setInterval(fetchData, 30000);
    const unsubscribe = subscribeToUpdates(fetchData);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [currentShop.shopId, currentShop.city, currentShop.area]);

  const handleRequestChat = async (request: RepairRequest) => {
    if (!quotationInput.trim()) {
      toast({
        title: "Enter a quotation",
        description: "Please provide a price quote before requesting chat",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('enlance_token');
      if (!token) return;

      await shopAPI.sendQuotation({
        requestId: request._id || request.id,
        price: parseFloat(quotationInput),
        message: `Hi ${request.userName}! I can help fix your ${request.brand} ${request.model}. My quotation: ₹${quotationInput}. Let's discuss further!`
      }, token);

      toast({
        title: "Chat Request Sent! ✓",
        description: "User will be notified. Wait for their response.",
      });

      setQuotationInput("");
      setViewDetailsOpen(false);

      // Refresh data
      window.location.reload(); // Simple way to refresh all data for now
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Could not send quotation.",
        variant: "destructive",
      });
    }
  };

  // Load messages when chat is active
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('enlance_token');
        if (!token) return;

        const room = chatRooms.find(r => r.id === activeChat);
        if (!room) return;

        const fetchedMessages = await chatAPI.getMessages(room.requestId, token);
        // Transform raw API response to the format expected by the UI
        const formatted = (fetchedMessages.data || []).map((m: any) => {
          const senderId = m.senderId?._id?.toString() || m.senderId?.toString();
          const isShop = senderId === room.shopId?.toString();
          return {
            id: m._id,
            text: m.message,
            sender: isShop ? 'shop' : 'user',
            time: new Date(m.createdAt).toLocaleTimeString(),
            createdAt: m.createdAt
          };
        });
        setChatRooms(prev => prev.map(r =>
          r.id === activeChat ? { ...r, messages: formatted } : r
        ));
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [activeChat]);

  // When shopkeeper opens a chat, mark it as read
  const handleOpenChat = (roomId: string) => {
    setActiveChat(roomId);
    const lastReads = JSON.parse(localStorage.getItem('enlance_shop_last_reads') || '{}');
    lastReads[roomId] = Date.now();
    localStorage.setItem('enlance_shop_last_reads', JSON.stringify(lastReads));
    setUnreadCounts(prev => ({ ...prev, [roomId]: 0 }));
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !activeChat) return;

    try {
      const token = localStorage.getItem('enlance_token');
      if (!token) return;

      const room = chatRooms.find(r => r.id === activeChat);
      if (!room) return;

      await chatAPI.sendMessage({
        requestId: room.requestId,
        receiverId: room.userId,
        message: chatMessage
      }, token);

      setChatMessage("");
      // Messages will be updated by the polling useEffect
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
      case "pending":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25">
            New Request
          </span>
        );
      case "chat_requested":
      case "quoted":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25">
            Quoted
          </span>
        );
      case "accepted":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/25">
            Accepted
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary/80 to-primary text-white shadow-md shadow-primary/25">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const activeChatRoom = chatRooms.find((r) => r.id === activeChat);
  const acceptedChats = chatRooms.filter((r) => r.status === "accepted");
  const pendingChats = chatRooms.filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingChats.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingChats.length}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-semibold">
                      {currentShop.shopAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="font-medium text-sm">{currentShop.shopName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Verified Shop
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentShop.shopName}</p>
                    <p className="text-xs text-muted-foreground">{currentShop.city || "Coimbatore"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {currentShop.shopLocationUrl && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <a href={currentShop.shopLocationUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="mr-2 h-4 w-4" />
                      View Shop Location
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer">
                  <Store className="mr-2 h-4 w-4" />
                  Shop Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => navigate("/")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Shop Location Banner */}
        {currentShop.shopLocation && (
          <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{currentShop.shopLocation}</p>
                <p className="text-sm text-muted-foreground">Serving customers in {currentShop.city || "Coimbatore"}</p>
              </div>
            </div>
            {currentShop.shopLocationUrl && (
              <a
                href={currentShop.shopLocationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View on Map
              </a>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "New Requests", value: requests.filter((r) => r.status === "new").length, icon: Bell, gradient: "from-blue-500 to-cyan-500" },
            { label: "Active Chats", value: acceptedChats.length, icon: MessageSquare, gradient: "from-green-500 to-emerald-500" },
            { label: "Pending Response", value: pendingChats.length, icon: Clock, gradient: "from-amber-500 to-orange-500" },
            { label: "Rating", value: currentShop.shopRating, icon: Star, gradient: "from-purple-500 to-pink-500" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-4 shadow-lg border border-border/50 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="requests" className="rounded-lg data-[state=active]:shadow-md">
              <Wrench className="mr-2 h-4 w-4" />
              Repair Requests
            </TabsTrigger>
            <TabsTrigger value="chats" className="rounded-lg data-[state=active]:shadow-md">
              <MessageSquare className="mr-2 h-4 w-4" />
              Active Chats
              {acceptedChats.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {acceptedChats.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Repair Requests</h2>
                <p className="text-sm text-muted-foreground">
                  Showing requests from {currentShop.area || "RS Puram"}, {currentShop.city || "Coimbatore"} • Completed requests auto-delete after 1 day
                </p>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-10 w-10 text-primary/50" />
                </div>
                <p className="font-semibold text-foreground">No repair requests yet</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Waiting for customers in {currentShop.area || "RS Puram"}, {currentShop.city || "Coimbatore"} to submit requests
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((request, index) => (
                  <div
                    key={request._id || request.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-slide-up group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden">
                      {request.image ? (
                        <img
                          src={request.image}
                          alt="Issue"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Smartphone className="h-12 w-12 text-primary/50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">{getStatusBadge(request.status)}</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-white/50">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-bold">
                              {request.userAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-semibold text-sm">{request.userName}</p>
                            <p className="text-white/70 text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.city}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {request.brand} {request.model}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{request.issue}</p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Clock className="h-3.5 w-3.5" />
                        {request.time}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setViewDetailsOpen(true);
                          }}
                          className="rounded-xl h-11 border-border/50 hover:bg-primary/5 hover:border-primary/30"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedRequest(request);
                            setViewDetailsOpen(true);
                          }}
                          disabled={request.status === "chat_requested"}
                          className={`rounded-xl h-11 shadow-lg ${request.status === "chat_requested" ? "opacity-50" : "shadow-primary/25 hover:shadow-xl"
                            }`}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {request.status === "chat_requested" ? "Requested" : "Send Quote"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="space-y-6">
            {!activeChat ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Active Chats</h2>
                    <p className="text-sm text-muted-foreground">Communicate with customers who accepted your quote</p>
                  </div>
                </div>

                {acceptedChats.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-green-500/50" />
                    </div>
                    <p className="font-semibold text-foreground">No active chats yet</p>
                    <p className="text-muted-foreground text-sm mt-1">Send quotes to customers to start conversations</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {acceptedChats.map((room, index) => (
                      <div
                        key={room.id}
                        onClick={() => handleOpenChat(room.id)}
                        className="bg-card rounded-2xl p-5 shadow-lg border border-border/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] animate-slide-up cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-14 w-14 border-2 border-green-500/30 shadow-md">
                              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                                {room.userAvatar}
                              </AvatarFallback>
                            </Avatar>
                            {(unreadCounts[room.id] || 0) > 0 && (
                              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                                {unreadCounts[room.id]}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-card-foreground text-lg">{room.userName}</h3>
                              <span className="text-xs text-muted-foreground">{room.lastMessageTime}</span>
                            </div>
                            <p className="text-muted-foreground line-clamp-1">{room.lastMessage}</p>
                          </div>

                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Active Chat View
              <div className="bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-gradient-to-r from-green-500/5 to-emerald-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)} className="rounded-xl">
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </Button>
                    <Avatar className="h-10 w-10 border-2 border-green-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                        {activeChatRoom?.userAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-foreground">{activeChatRoom?.userName}</h3>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active Chat
                      </p>
                    </div>
                  </div>
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background">
                  {activeChatRoom?.messages.map((msg, i) => (
                    <div key={msg.id || i} className={`flex ${msg.sender === "shop" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === "shop"
                          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                          : "bg-card border border-border shadow-md"
                          }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "shop" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Type your message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 h-12 rounded-xl border-border/50 bg-background"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      className="h-12 w-12 rounded-xl shadow-lg shadow-primary/25"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Repair Request Details
            </DialogTitle>
            <DialogDescription>Review the issue and send a quotation</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Image */}
              {selectedRequest.image && (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img src={selectedRequest.image} alt="Issue" className="w-full h-48 object-cover" />
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                      {selectedRequest.userAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{selectedRequest.userName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedRequest.city}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {selectedRequest.brand} {selectedRequest.model}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.issue}</p>
                </div>

                {/* Quotation Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Your Quotation (₹)</label>
                  <Input
                    type="number"
                    placeholder="Enter price quote"
                    value={quotationInput}
                    onChange={(e) => setQuotationInput(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <Button
                  onClick={() => selectedRequest && handleRequestChat(selectedRequest)}
                  disabled={!quotationInput.trim() || selectedRequest.status === "chat_requested"}
                  className="w-full h-12 rounded-xl shadow-lg shadow-primary/25"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {selectedRequest.status === "chat_requested" ? "Already Requested" : "Send Quote & Request Chat"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopkeeperDashboard;
