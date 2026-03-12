// Shared Chat Service - connects User and Shopkeeper dashboards via localStorage

export interface RepairRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  city: string;
  area: string;
  brand: string;
  model: string;
  issue: string;
  image: string | null;
  time: string;
  timestamp: number;
  status: "new" | "chat_requested" | "accepted" | "completed" | "rejected";
  rejectionReason?: string;
  completedAt?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "shop";
  senderName: string;
  time: string;
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  requestId: string;
  shopId: string;
  shopName: string;
  shopAvatar: string;
  shopRating: number;
  shopLocation?: string;
  shopLocationUrl?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  status: "pending" | "accepted" | "rejected";
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: string;
  quotation?: string;
}

export interface RegisteredShop {
  shopId: string;
  shopName: string;
  shopAvatar: string;
  shopRating: number;
  shopLocation: string;
  shopLocationUrl: string;
  city: string;
  area: string;
  email: string;
  specialties: string[];
}

const STORAGE_KEYS = {
  REQUESTS: "enlance_repair_requests",
  CHAT_ROOMS: "enlance_chat_rooms",
  CURRENT_USER: "enlance_current_user",
  CURRENT_SHOP: "enlance_current_shop",
  REGISTERED_SHOPS: "enlance_registered_shops",
};

// Available cities
export const CITIES = [
  "Coimbatore",
  "Tirupur",
  "Chennai",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Pune",
  "Kolkata",
];

// City → Area mapping
export const CITY_AREAS: Record<string, string[]> = {
  Coimbatore: ["RS Puram", "Gandhipuram", "Hopes", "Kalapatti", "Saibaba Colony", "Peelamedu", "Singanallur"],
  Tirupur: ["SAP", "Old Bus Stand", "New Bus Stand", "Palladam Road", "Avinashi Road"],
  Chennai: ["T. Nagar", "Anna Nagar", "Velachery", "Tambaram", "Adyar", "Mylapore"],
  Bangalore: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Jayanagar", "Electronic City"],
  Mumbai: ["Andheri", "Bandra", "Dadar", "Powai", "Thane", "Navi Mumbai"],
  Delhi: ["Connaught Place", "Saket", "Karol Bagh", "Lajpat Nagar", "Dwarka", "Rohini"],
  Hyderabad: ["Ameerpet", "Hitech City", "Kukatpally", "Secunderabad", "Banjara Hills"],
  Pune: ["FC Road", "Kothrud", "Hinjewadi", "Viman Nagar", "Hadapsar"],
  Kolkata: ["Park Street", "Salt Lake", "New Town", "Howrah", "Gariahat"],
};

// Initialize with demo shops data
const initializeDemoData = () => {
  const existingRequests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  if (!existingRequests) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
  }

  const existingRooms = localStorage.getItem(STORAGE_KEYS.CHAT_ROOMS);
  if (!existingRooms) {
    localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify([]));
  }

  // Initialize registered shops - force refresh if shops don't have 'area' field (schema update)
  const existingShops = localStorage.getItem(STORAGE_KEYS.REGISTERED_SHOPS);
  const needsRefresh = existingShops && JSON.parse(existingShops)?.[0] && !JSON.parse(existingShops)[0].area;
  if (!existingShops || needsRefresh) {
    const demoShops: RegisteredShop[] = [
      {
        shopId: "shop_vaishnavi",
        shopName: "Vaishnavi Mobile Repairs",
        shopAvatar: "V",
        shopRating: 4.9,
        shopLocation: "RS Puram, Coimbatore",
        shopLocationUrl: "https://maps.google.com/?q=RS+Puram+Coimbatore",
        city: "Coimbatore",
        area: "RS Puram",
        email: "vaishnavi@gmail.com",
        specialties: ["Screen Repair", "Battery Replacement", "Water Damage"],
      },
      {
        shopId: "shop_varshini",
        shopName: "Varshini Mobile Repairs",
        shopAvatar: "VA",
        shopRating: 4.7,
        shopLocation: "Gandhipuram, Coimbatore",
        shopLocationUrl: "https://maps.google.com/?q=Gandhipuram+Coimbatore",
        city: "Coimbatore",
        area: "Gandhipuram",
        email: "varshini@gmail.com",
        specialties: ["Tempered Glass", "Accessories", "Software Issues"],
      },
      {
        shopId: "shop_srikumaran",
        shopName: "Srikumaran Mobile Repairs",
        shopAvatar: "SK",
        shopRating: 4.8,
        shopLocation: "Saibaba Colony, Coimbatore",
        shopLocationUrl: "https://maps.google.com/?q=Saibaba+Colony+Coimbatore",
        city: "Coimbatore",
        area: "Saibaba Colony",
        email: "srikumaran@gmail.com",
        specialties: ["All Brands", "Charging Port", "Speaker Issues"],
      },
      {
        shopId: "shop_kalapatti_mobile",
        shopName: "Kalapatti Mobile Hub",
        shopAvatar: "KM",
        shopRating: 4.5,
        shopLocation: "Kalapatti, Coimbatore",
        shopLocationUrl: "https://maps.google.com/?q=Kalapatti+Coimbatore",
        city: "Coimbatore",
        area: "Kalapatti",
        email: "kalapatti@gmail.com",
        specialties: ["Screen Repair", "Accessories", "Fast Service"],
      },
      {
        shopId: "shop_hopes_tech",
        shopName: "Hopes Tech Solutions",
        shopAvatar: "HT",
        shopRating: 4.6,
        shopLocation: "Hopes, Coimbatore",
        shopLocationUrl: "https://maps.google.com/?q=Hopes+Coimbatore",
        city: "Coimbatore",
        area: "Hopes",
        email: "hopes@gmail.com",
        specialties: ["Software Issues", "Unlocking", "Data Recovery"],
      },
      {
        shopId: "shop_tirupur_sap",
        shopName: "SAP Mobile Care",
        shopAvatar: "SM",
        shopRating: 4.8,
        shopLocation: "SAP, Tirupur",
        shopLocationUrl: "https://maps.google.com/?q=SAP+Tirupur",
        city: "Tirupur",
        area: "SAP",
        email: "sapmobile@gmail.com",
        specialties: ["All Brands", "Screen Repair", "Battery"],
      },
      {
        shopId: "shop_tirupur_oldbus",
        shopName: "Quick Fix Mobiles",
        shopAvatar: "QF",
        shopRating: 4.4,
        shopLocation: "Old Bus Stand, Tirupur",
        shopLocationUrl: "https://maps.google.com/?q=Old+Bus+Stand+Tirupur",
        city: "Tirupur",
        area: "Old Bus Stand",
        email: "quickfix@gmail.com",
        specialties: ["Tempered Glass", "Accessories", "Fast Repair"],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.REGISTERED_SHOPS, JSON.stringify(demoShops));
  }
};

// Cleanup completed requests older than 1 day (called separately, not from initializeDemoData)
const cleanupCompletedRequests = () => {
  const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  if (!data) return;
  
  const requests: RepairRequest[] = JSON.parse(data);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const filtered = requests.filter(
    (r) => !(r.status === "completed" && r.completedAt && r.completedAt < oneDayAgo)
  );
  if (filtered.length !== requests.length) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(filtered));
  }
};

// Get all registered shops
export const getRegisteredShops = (): RegisteredShop[] => {
  initializeDemoData();
  const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_SHOPS);
  return data ? JSON.parse(data) : [];
};

// Get shops by city
export const getShopsByCity = (city: string): RegisteredShop[] => {
  return getRegisteredShops().filter(
    (shop) => shop.city && shop.city.toLowerCase() === city.toLowerCase()
  );
};

// Get all repair requests
export const getRepairRequests = (): RepairRequest[] => {
  initializeDemoData();
  cleanupCompletedRequests(); // Cleanup old completed requests
  const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  return data ? JSON.parse(data) : [];
};

// Get requests by city (for shopkeepers) - legacy, use getRequestsByCityAndArea instead
export const getRequestsByCity = (city: string): RepairRequest[] => {
  return getRepairRequests().filter(
    (r) => r.city && r.city.toLowerCase() === city.toLowerCase() && r.status !== "completed" && r.status !== "rejected"
  );
};

// Get requests by city AND area (for shopkeepers - CORE routing logic)
export const getRequestsByCityAndArea = (city: string, area: string): RepairRequest[] => {
  return getRepairRequests().filter(
    (r) => 
      r.city && 
      r.area && 
      r.city.toLowerCase() === city.toLowerCase() && 
      r.area.toLowerCase() === area.toLowerCase() && 
      r.status !== "completed" && 
      r.status !== "rejected"
  );
};

// Add a new repair request (from User)
export const addRepairRequest = (
  request: Omit<RepairRequest, "id" | "time" | "status" | "timestamp">
): RepairRequest => {
  const requests = getRepairRequests();
  const newRequest: RepairRequest = {
    ...request,
    id: `req_${Date.now()}`,
    time: "Just now",
    timestamp: Date.now(),
    status: "new",
  };
  requests.unshift(newRequest);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent("enlance_data_update"));
  return newRequest;
};

// Mark request as completed
export const markRequestCompleted = (requestId: string): void => {
  const requests = getRepairRequests();
  const updatedRequests = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: "completed" as const, completedAt: Date.now() }
      : r
  );
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));
  window.dispatchEvent(new CustomEvent("enlance_data_update"));
};

// Reject request with reason
export const rejectRequest = (requestId: string, reason: string): void => {
  const requests = getRepairRequests();
  const updatedRequests = requests.map((r) =>
    r.id === requestId
      ? { ...r, status: "rejected" as const, rejectionReason: reason }
      : r
  );
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));
  window.dispatchEvent(new CustomEvent("enlance_data_update"));
};

// Get all chat rooms
export const getChatRooms = (): ChatRoom[] => {
  initializeDemoData();
  const data = localStorage.getItem(STORAGE_KEYS.CHAT_ROOMS);
  return data ? JSON.parse(data) : [];
};

// Get chat rooms for a specific user
export const getUserChatRooms = (userId: string): ChatRoom[] => {
  return getChatRooms().filter((room) => room.userId === userId);
};

// Get chat rooms for a specific shop
export const getShopChatRooms = (shopId: string): ChatRoom[] => {
  return getChatRooms().filter((room) => room.shopId === shopId);
};

// Shop requests chat with a user
export const requestChat = (
  requestId: string,
  shopId: string,
  shopName: string,
  shopAvatar: string,
  shopRating: number,
  initialMessage: string,
  shopLocation?: string,
  shopLocationUrl?: string
): ChatRoom => {
  const requests = getRepairRequests();
  const request = requests.find((r) => r.id === requestId);

  if (!request) throw new Error("Request not found");

  // Update request status
  const updatedRequests = requests.map((r) =>
    r.id === requestId ? { ...r, status: "chat_requested" as const } : r
  );
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));

  // Create chat room
  const chatRooms = getChatRooms();
  const existingRoom = chatRooms.find(
    (room) => room.requestId === requestId && room.shopId === shopId
  );

  if (existingRoom) return existingRoom;

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const newRoom: ChatRoom = {
    id: `chat_${Date.now()}`,
    requestId,
    shopId,
    shopName,
    shopAvatar,
    shopRating,
    shopLocation,
    shopLocationUrl,
    userId: request.userId,
    userName: request.userName,
    userAvatar: request.userAvatar,
    status: "pending",
    messages: [
      {
        id: `msg_${Date.now()}`,
        text: initialMessage,
        sender: "shop",
        senderName: shopName,
        time: timeString,
        timestamp: now.getTime(),
      },
    ],
    lastMessage: initialMessage,
    lastMessageTime: timeString,
  };

  chatRooms.push(newRoom);
  localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(chatRooms));
  window.dispatchEvent(new CustomEvent("enlance_data_update"));
  return newRoom;
};

// User accepts or rejects chat
export const respondToChat = (roomId: string, accept: boolean): void => {
  const chatRooms = getChatRooms();
  const updatedRooms = chatRooms.map((room) =>
    room.id === roomId
      ? { ...room, status: accept ? ("accepted" as const) : ("rejected" as const) }
      : room
  );
  localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(updatedRooms));
  window.dispatchEvent(new CustomEvent("enlance_data_update"));
};

// Send a message
export const sendMessage = (
  roomId: string,
  text: string,
  sender: "user" | "shop",
  senderName: string
): ChatMessage => {
  const chatRooms = getChatRooms();
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    text,
    sender,
    senderName,
    time: timeString,
    timestamp: now.getTime(),
  };

  const updatedRooms = chatRooms.map((room) =>
    room.id === roomId
      ? {
          ...room,
          messages: [...room.messages, newMessage],
          lastMessage: text,
          lastMessageTime: timeString,
        }
      : room
  );

  localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(updatedRooms));
  window.dispatchEvent(new CustomEvent("enlance_data_update"));
  return newMessage;
};

// Get messages for a chat room
export const getChatMessages = (roomId: string): ChatMessage[] => {
  const chatRooms = getChatRooms();
  const room = chatRooms.find((r) => r.id === roomId);
  return room ? room.messages : [];
};

// Get a specific chat room
export const getChatRoom = (roomId: string): ChatRoom | undefined => {
  return getChatRooms().find((r) => r.id === roomId);
};

// Subscribe to data updates
export const subscribeToUpdates = (callback: () => void): (() => void) => {
  const handler = () => callback();
  window.addEventListener("enlance_data_update", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("enlance_data_update", handler);
    window.removeEventListener("storage", handler);
  };
};

// User can initiate chat with a shop
export const userInitiateChat = (
  userId: string,
  userName: string,
  userAvatar: string,
  shop: RegisteredShop,
  initialMessage: string
): ChatRoom => {
  const chatRooms = getChatRooms();
  
  // Check if chat already exists
  const existingRoom = chatRooms.find(
    (room) => room.userId === userId && room.shopId === shop.shopId && !room.requestId
  );
  if (existingRoom) return existingRoom;

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const newRoom: ChatRoom = {
    id: `chat_${Date.now()}`,
    requestId: "",
    shopId: shop.shopId,
    shopName: shop.shopName,
    shopAvatar: shop.shopAvatar,
    shopRating: shop.shopRating,
    shopLocation: shop.shopLocation,
    shopLocationUrl: shop.shopLocationUrl,
    userId,
    userName,
    userAvatar,
    status: "accepted", // Direct chat is auto-accepted
    messages: [
      {
        id: `msg_${Date.now()}`,
        text: initialMessage,
        sender: "user",
        senderName: userName,
        time: timeString,
        timestamp: now.getTime(),
      },
    ],
    lastMessage: initialMessage,
    lastMessageTime: timeString,
  };

  chatRooms.push(newRoom);
  localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(chatRooms));
  window.dispatchEvent(new CustomEvent("enlance_data_update"));
  return newRoom;
};

// Current user/shop session helpers
export const setCurrentUser = (
  userId: string,
  userName: string,
  userAvatar: string,
  city?: string,
  location?: string
) => {
  localStorage.setItem(
    STORAGE_KEYS.CURRENT_USER,
    JSON.stringify({ userId, userName, userAvatar, city, location })
  );
};

export const getCurrentUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data
    ? JSON.parse(data)
    : { userId: "user_santhosh", userName: "Santhosh", userAvatar: "S", city: "Coimbatore" };
};

export const setCurrentShop = (
  shopId: string,
  shopName: string,
  shopAvatar: string,
  shopRating: number,
  shopLocation?: string,
  shopLocationUrl?: string,
  city?: string,
  area?: string
) => {
  localStorage.setItem(
    STORAGE_KEYS.CURRENT_SHOP,
    JSON.stringify({ shopId, shopName, shopAvatar, shopRating, shopLocation, shopLocationUrl, city, area })
  );
};

export const getCurrentShop = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SHOP);
  return data
    ? JSON.parse(data)
    : {
        shopId: "shop_vaishnavi",
        shopName: "Vaishnavi Mobile Repairs",
        shopAvatar: "V",
        shopRating: 4.9,
        shopLocation: "RS Puram, Coimbatore",
        shopLocationUrl: "https://maps.google.com/?q=RS+Puram+Coimbatore",
        city: "Coimbatore",
        area: "RS Puram",
      };
};
