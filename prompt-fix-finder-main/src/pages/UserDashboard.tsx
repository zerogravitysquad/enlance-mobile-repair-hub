import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Upload,
  Send,
  LogOut,
  Smartphone,
  X,
  Check,
  User,
  Settings,
  Bell,
  ChevronRight,
  Store,
  Star,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentUser,
  getUserChatRooms,
  addRepairRequest,
  respondToChat,
  sendMessage,
  subscribeToUpdates,
  ChatRoom,
  getRegisteredShops,
  userInitiateChat,
  RegisteredShop,
  CITIES,
  CITY_AREAS,
  getRepairRequests,
  markRequestCompleted,
  rejectRequest,
  RepairRequest,
} from "@/lib/chatService";
import { requestAPI, chatAPI } from "@/lib/api";

const mobileBrands = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Oppo",
  "Vivo",
  "Google",
  "Motorola",
  "Nokia",
  "Other",
];

const mobileModels: Record<string, string[]> = {
  Apple: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro", "iPhone 14", "iPhone 13", "iPhone 12", "Other"],
  Samsung: ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy A54", "Galaxy A34", "Galaxy M54", "Other"],
  OnePlus: ["12 Pro", "12", "11 Pro", "11", "Nord 3", "Nord CE 3", "Other"],
  Xiaomi: ["14 Pro", "14", "13T Pro", "Redmi Note 13 Pro", "Redmi Note 13", "Other"],
  Realme: ["GT 5 Pro", "GT 3", "12 Pro+", "Narzo 60 Pro", "Other"],
  Oppo: ["Find X7 Ultra", "Reno 11 Pro", "Reno 11", "A79", "Other"],
  Vivo: ["X100 Pro", "X100", "V29 Pro", "V29", "Y100", "Other"],
  Google: ["Pixel 8 Pro", "Pixel 8", "Pixel 7a", "Pixel 7", "Other"],
  Motorola: ["Edge 40 Pro", "Edge 40", "Razr 40", "G84", "Other"],
  Nokia: ["G42", "C32", "X30", "Other"],
  Other: ["Other"],
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"request" | "chats" | "shops" | "my-requests">("request");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    issue: "",
    city: "",
    area: "",
  });
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [shops, setShops] = useState<RegisteredShop[]>([]);
  const [myRequests, setMyRequests] = useState<RepairRequest[]>([]);
  const [shopChatDialog, setShopChatDialog] = useState<RegisteredShop | null>(null);
  const [shopChatMessage, setShopChatMessage] = useState("");
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [shopFilterCity, setShopFilterCity] = useState("");
  const [shopFilterArea, setShopFilterArea] = useState("");

  const [currentUser] = useState(() => getCurrentUser());

  // Load data and subscribe to updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('enlance_token');
        if (!token) return;

        // Fetch real requests
        if (currentUser?.userId) {
          const fetchedRequests = await requestAPI.getUserRequests(currentUser.userId, token);
          const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
          const mappedRequests = (fetchedRequests.data || []).map((req: any) => ({
            ...req,
            issue: req.description,
            image: req.imagePath ? (req.imagePath.startsWith('http') ? req.imagePath : `${baseUrl}/${req.imagePath.replace(/\\/g, '/')}`) : null,
            time: new Date(req.createdAt).toLocaleDateString() + ' ' + new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMyRequests(mappedRequests);
        }

        // Fetch registered shops (this can still use mock or we can add an API for it)
        setShops(getRegisteredShops());

        // Fetch active chats
        const fetchedRooms = await chatAPI.getRooms(token);
        // Apply persisted accept/reject decisions from localStorage
        const persistedStatuses: Record<string, string> = JSON.parse(localStorage.getItem('enlance_chat_statuses') || '{}');
        const rooms = (fetchedRooms.data || []).map((room: any) => ({
          ...room,
          status: persistedStatuses[room.id] || room.status
        }));
        setChatRooms(rooms);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
    const unsubscribe = subscribeToUpdates(fetchData);
    return unsubscribe;
  }, [currentUser.userId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRequest = async () => {
    if (!formData.brand || !formData.model || !formData.issue || !formData.city || !formData.area) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields including city and area",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('enlance_token');
      if (!token) {
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        navigate("/user/login");
        return;
      }

      // Use FormData to send file correctly to Multer backend
      const requestData = new FormData();
      requestData.append('brand', formData.brand);
      requestData.append('model', formData.model);
      requestData.append('description', formData.issue); // Backend validation expects 'description', not 'issue'
      requestData.append('city', formData.city);
      requestData.append('area', formData.area);

      // Convert base64 image back to a file for upload
      if (selectedImage) {
        // Simple base64 to Blob conversion
        const fetchResponse = await fetch(selectedImage);
        const blob = await fetchResponse.blob();
        requestData.append('image', blob, 'issue-image.jpg');
      }

      await requestAPI.create(requestData, token);

      toast({
        title: "Request Submitted! 🚀",
        description: `Your request has been sent to repair shops in ${formData.area}, ${formData.city}.`,
      });

      setFormData({ brand: "", model: "", issue: "", city: "", area: "" });
      setSelectedImage(null);

      // Refresh requests list
      loadUserRequests();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadUserRequests = async () => {
    try {
      const token = localStorage.getItem('enlance_token');
      if (token && currentUser?.userId) {
        const requests = await requestAPI.getUserRequests(currentUser.userId, token);
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
        const mappedRequests = (requests.data || []).map((req: any) => ({
          ...req,
          issue: req.description,
          image: req.imagePath ? (req.imagePath.startsWith('http') ? req.imagePath : `${baseUrl}/${req.imagePath.replace(/\\/g, '/')}`) : null,
          time: new Date(req.createdAt).toLocaleDateString() + ' ' + new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMyRequests(mappedRequests);
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
  };

  const handleChatAction = (roomId: string, action: "accept" | "reject") => {
    respondToChat(roomId, action === "accept");

    const newStatus = action === "accept" ? "accepted" : "rejected";

    // Persist to localStorage so buttons don't reappear after refresh
    const persistedStatuses = JSON.parse(localStorage.getItem('enlance_chat_statuses') || '{}');
    persistedStatuses[roomId] = newStatus;
    localStorage.setItem('enlance_chat_statuses', JSON.stringify(persistedStatuses));

    // Update local state immediately
    setChatRooms(prev => prev.map(r =>
      r.id === roomId ? { ...r, status: newStatus } : r
    ));

    if (action === "accept") {
      // Don't auto-open the chat – just show the "Open Chat" button in the list
      toast({
        title: "Chat Accepted! ✓",
        description: "Click 'Open Chat' to start messaging the shopkeeper",
      });
    } else {
      toast({
        title: "Chat Rejected",
        description: "Request has been declined",
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
          const isUser = senderId === room.userId?.toString();
          return {
            id: m._id,
            text: m.message,
            sender: isUser ? 'user' : 'shop',
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

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !activeChat) return;

    try {
      const token = localStorage.getItem('enlance_token');
      if (!token) return;

      const room = chatRooms.find(r => r.id === activeChat);
      if (!room) return;

      await chatAPI.sendMessage({
        requestId: room.requestId,
        receiverId: room.shopId,
        message: chatMessage
      }, token);

      setChatMessage("");
      // Messages will be updated by the polling useEffect
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleStartShopChat = () => {
    if (!shopChatMessage.trim() || !shopChatDialog) return;

    userInitiateChat(
      currentUser.userId,
      currentUser.userName,
      currentUser.userAvatar,
      shopChatDialog,
      shopChatMessage
    );

    toast({
      title: "Chat Started! ✓",
      description: `You can now chat with ${shopChatDialog.shopName}`,
    });

    setShopChatDialog(null);
    setShopChatMessage("");
    setActiveTab("chats");
  };

  const handleMarkCompleted = async (requestId: string) => {
    try {
      const token = localStorage.getItem('enlance_token');
      if (!token) return;

      await requestAPI.markCompleted(requestId, token);

      toast({
        title: "Marked as Completed! ✓",
        description: "Your repair request has been marked as completed.",
      });

      // Refresh requests list
      loadUserRequests();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update status.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = () => {
    if (!rejectDialog || !rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    rejectRequest(rejectDialog, rejectReason);
    toast({
      title: "Request Rejected",
      description: "Your repair request has been rejected.",
    });
    setRejectDialog(null);
    setRejectReason("");
  };

  const activeChatRoom = chatRooms.find((r) => r.id === activeChat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {chatRooms.filter((r) => r.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chatRooms.filter((r) => r.status === "pending").length}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-semibold">
                      {currentUser.userAvatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium text-sm">{currentUser.userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.userName}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.userName.toLowerCase()}@gmail.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
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
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setActiveChat(null); }} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="request" className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm">
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New</span> Request
            </TabsTrigger>
            <TabsTrigger value="chats" className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm">
              <MessageSquare className="mr-1 sm:mr-2 h-4 w-4" />
              Chats
              {chatRooms.filter((r) => r.status === "pending").length > 0 && (
                <span className="ml-1 sm:ml-2 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                  {chatRooms.filter((r) => r.status === "pending").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="shops" className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm">
              <Store className="mr-1 sm:mr-2 h-4 w-4" />
              Shops
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm">
              <Smartphone className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">My</span> Requests
            </TabsTrigger>
          </TabsList>

          {/* New Request Tab */}
          <TabsContent value="request" className="animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground">
                      Submit Repair Request
                    </h2>
                    <p className="text-sm text-muted-foreground">Get quotes from verified repair shops</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* City and Area Selection */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Select City</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => setFormData({ ...formData, city: value, area: "" })}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Select Main Location / Area</Label>
                      <Select
                        value={formData.area}
                        onValueChange={(value) => setFormData({ ...formData, area: value })}
                        disabled={!formData.city}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
                          <SelectValue placeholder={formData.city ? "Select area" : "Select city first"} />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {formData.city && CITY_AREAS[formData.city]?.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-4">
                    Your request will be sent to shops in {formData.area ? `${formData.area}, ${formData.city}` : "your selected area"}
                  </p>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Upload Issue Image</Label>
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:scale-[1.01] ${selectedImage ? "border-primary bg-primary/5" : "border-border"
                        }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {selectedImage ? (
                        <div className="relative">
                          <img
                            src={selectedImage}
                            alt="Uploaded issue"
                            className="max-h-48 mx-auto rounded-xl shadow-lg"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(null);
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-8 w-8 text-primary" />
                          </div>
                          <p className="font-semibold text-foreground">Click or drag to upload</p>
                          <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Brand Selection */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Mobile Brand</Label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) =>
                          setFormData({ ...formData, brand: value, model: "" })
                        }
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {mobileBrands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Mobile Model</Label>
                      <Select
                        value={formData.model}
                        onValueChange={(value) =>
                          setFormData({ ...formData, model: value })
                        }
                        disabled={!formData.brand}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {formData.brand &&
                            mobileModels[formData.brand]?.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Issue Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Describe the Issue</Label>
                    <Textarea
                      placeholder="Please describe the problem with your mobile device in detail... (e.g., screen crack, need tempered glass, battery issue)"
                      rows={4}
                      value={formData.issue}
                      onChange={(e) =>
                        setFormData({ ...formData, issue: e.target.value })
                      }
                      className="rounded-xl border-border/50 bg-background/50 resize-none"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                    onClick={handleSubmitRequest}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send Request to Shops in {formData.area ? `${formData.area}, ${formData.city}` : formData.city || "City"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              {!activeChat ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Chat Requests
                      </h2>
                      <p className="text-muted-foreground text-sm">Sorted by shop rating (highest first)</p>
                    </div>
                  </div>

                  {chatRooms.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-10 w-10 text-primary/50" />
                      </div>
                      <p className="font-semibold text-foreground">No chat requests yet</p>
                      <p className="text-muted-foreground text-sm mt-1">Submit a repair request or browse shops to start chatting</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {chatRooms.map((room, index) => (
                        <div
                          key={room.id}
                          className={`bg-card rounded-2xl p-5 shadow-lg border border-border/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] animate-slide-up ${room.status === "rejected" ? "opacity-50" : ""
                            }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                                {room.shopAvatar}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-card-foreground text-lg">
                                  {room.shopName}
                                </h3>
                                <div className="flex items-center gap-1 text-amber-500">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-sm font-semibold">{room.shopRating}</span>
                                </div>
                              </div>
                              {room.shopLocation && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <MapPin className="h-3 w-3" />
                                  <span>{room.shopLocation}</span>
                                  {room.shopLocationUrl && (
                                    <a
                                      href={room.shopLocationUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      View on Map
                                    </a>
                                  )}
                                </div>
                              )}
                              <p className="text-muted-foreground line-clamp-2">
                                {room.lastMessage}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{room.lastMessageTime}</p>

                              {room.status === "accepted" && (
                                <Button
                                  onClick={() => setActiveChat(room.id)}
                                  className="mt-3 rounded-xl shadow-md shadow-primary/20"
                                  size="sm"
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Open Chat
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                              )}

                              {room.status === "rejected" && (
                                <span className="inline-flex items-center mt-3 text-sm font-medium px-3 py-1 rounded-full bg-destructive/10 text-destructive">
                                  Declined
                                </span>
                              )}
                            </div>

                            {room.status === "pending" && (
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="icon"
                                  className="h-12 w-12 rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/25"
                                  onClick={() => handleChatAction(room.id, "accept")}
                                >
                                  <Check className="h-5 w-5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-12 w-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleChatAction(room.id, "reject")}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Active Chat View
                <div className="bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveChat(null)}
                        className="rounded-xl"
                      >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                      </Button>
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                          {activeChatRoom?.shopAvatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-foreground">{activeChatRoom?.shopName}</h3>
                        <div className="flex items-center gap-1 text-amber-500 text-sm">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-medium">{activeChatRoom?.shopRating}</span>
                          {activeChatRoom?.shopLocationUrl && (
                            <a
                              href={activeChatRoom.shopLocationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary ml-2 flex items-center gap-1 text-xs"
                            >
                              <MapPin className="h-3 w-3" />
                              Location
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <Store className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background">
                    {activeChatRoom?.messages.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === "user"
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-card border border-border shadow-md"
                            }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
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
            </div>
          </TabsContent>

          {/* Shops Tab */}
          <TabsContent value="shops" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Nearby Shops</h2>
                  <p className="text-sm text-muted-foreground">Find verified repair shops in your area</p>
                </div>
              </div>

              {/* Filter Section */}
              <div className="bg-card rounded-2xl p-4 mb-6 border border-border/50 shadow-md">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Select City</Label>
                    <Select
                      value={shopFilterCity}
                      onValueChange={(value) => { setShopFilterCity(value); setShopFilterArea(""); }}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/50 bg-background/50">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Select Area</Label>
                    <Select
                      value={shopFilterArea}
                      onValueChange={(value) => setShopFilterArea(value)}
                      disabled={!shopFilterCity}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/50 bg-background/50">
                        <SelectValue placeholder={shopFilterCity ? "Select area" : "Select city first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {shopFilterCity && CITY_AREAS[shopFilterCity]?.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Shops List - Filtered and Sorted by Rating */}
              {(() => {
                const filteredShops = shops
                  .filter((shop) => {
                    if (!shopFilterCity) return false;
                    if (shop.city.toLowerCase() !== shopFilterCity.toLowerCase()) return false;
                    if (shopFilterArea && shop.area !== shopFilterArea) return false;
                    return true;
                  })
                  .sort((a, b) => b.shopRating - a.shopRating);

                if (!shopFilterCity) {
                  return (
                    <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-10 w-10 text-primary/50" />
                      </div>
                      <p className="font-semibold text-foreground">Select Your Location</p>
                      <p className="text-muted-foreground text-sm mt-1">Choose your city and area to find nearby shops</p>
                    </div>
                  );
                }

                if (filteredShops.length === 0) {
                  return (
                    <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                        <Store className="h-10 w-10 text-primary/50" />
                      </div>
                      <p className="font-semibold text-foreground">No Shops Found</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        No shops available in {shopFilterArea ? `${shopFilterArea}, ` : ""}{shopFilterCity}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredShops.map((shop, index) => (
                      <div
                        key={shop.shopId}
                        className="bg-card rounded-2xl p-5 shadow-lg border border-border/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                              {shop.shopAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{shop.shopName}</h3>
                            <div className="flex items-center gap-1 text-amber-500 text-sm">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="font-medium">{shop.shopRating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{shop.area}, {shop.city}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {shop.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>

                        <Button
                          className="w-full rounded-xl"
                          onClick={() => setShopChatDialog(shop)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Start Chat
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">My Repair Requests</h2>
                  <p className="text-sm text-muted-foreground">Track and manage your repair requests</p>
                </div>
              </div>

              {myRequests.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-10 w-10 text-primary/50" />
                  </div>
                  <p className="font-semibold text-foreground">No requests yet</p>
                  <p className="text-muted-foreground text-sm mt-1">Submit a repair request to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myRequests.map((request, index) => (
                    <div
                      key={request._id || request.id}
                      className={`bg-card rounded-2xl p-5 shadow-lg border border-border/50 transition-all duration-300 animate-slide-up ${request.status === "completed" ? "border-green-500/30" : ""
                        } ${request.status === "rejected" ? "border-destructive/30 opacity-60" : ""}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {request.image && (
                          <img
                            src={request.image}
                            alt="Issue"
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-foreground">
                              {request.brand} {request.model}
                            </h3>
                            {(request.status === "new" || request.status === "pending") && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">New</span>
                            )}
                            {(request.status === "chat_requested" || request.status === "quoted") && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">Quoted</span>
                            )}
                            {request.status === "accepted" && (
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Accepted</span>
                            )}
                            {request.status === "completed" && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Completed
                              </span>
                            )}
                            {request.status === "rejected" && (
                              <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Rejected
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{request.issue}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.city}
                            </span>
                            <span>{request.time}</span>
                          </div>
                          {request.rejectionReason && (
                            <p className="text-sm text-destructive mt-2">
                              Reason: {request.rejectionReason}
                            </p>
                          )}
                        </div>

                        {request.status !== "completed" && request.status !== "rejected" && (
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              className="rounded-xl bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => handleMarkCompleted(request._id || request.id)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                              onClick={() => setRejectDialog(request._id || request.id)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Start Chat with Shop Dialog */}
      <Dialog open={!!shopChatDialog} onOpenChange={() => setShopChatDialog(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Start Chat with {shopChatDialog?.shopName}</DialogTitle>
            <DialogDescription>
              Send a message to start the conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Hi! I need help with... (e.g., tempered glass, screen repair, accessories)"
              value={shopChatMessage}
              onChange={(e) => setShopChatMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShopChatDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleStartShopChat} disabled={!shopChatMessage.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectRequest}
              disabled={!rejectReason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
