import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, User, Clock, Star, CreditCard, Users, ChevronRight, MessageCircle, Send, X } from 'lucide-react';

// Types
interface Stander {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  hourlyRate: number;
  location: { lat: number; lng: number; address: string };
  status: 'available' | 'in-queue' | 'busy';
  queuePosition: number;
  totalInQueue: number;
  estimatedWait: number;
  specialties: string[];
  completedJobs: number;
  reviews: Review[];
  profileImage: string;
  nearFrontPhoto?: string;
  lastUpdate: Date;
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface QueueHotspot {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  intensity: number;
  queueCount: number;
  averageWait: number;
}

interface ActiveQueue {
  id: string;
  stander: Stander;
  startTime: Date;
  progress: number;
  estimatedCompletion: Date;
  status: 'active' | 'ready-for-swap' | 'completed';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'stander';
  message: string;
  timestamp: Date;
}

// Mock Data
const mockStanders: Stander[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.9,
    hourlyRate: 25,
    location: { lat: 40.7589, lng: -73.9851, address: 'Times Square, NYC' },
    status: 'in-queue',
    queuePosition: 8,
    totalInQueue: 45,
    estimatedWait: 22,
    specialties: ['DMV', 'Apple Store', 'Government Offices'],
    completedJobs: 127,
    reviews: [
      { id: '1', user: 'Mike R.', rating: 5, comment: 'Amazing service! Saved me 3 hours at the DMV.', date: '2024-01-15' },
      { id: '2', user: 'Anna K.', rating: 5, comment: 'Professional and reliable. Will use again!', date: '2024-01-12' }
    ],
    lastUpdate: new Date()
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.8,
    hourlyRate: 30,
    location: { lat: 40.7505, lng: -73.9934, address: 'Herald Square, NYC' },
    status: 'available',
    queuePosition: 0,
    totalInQueue: 0,
    estimatedWait: 0,
    specialties: ['Electronics Stores', 'Sneaker Releases', 'Pop-up Events'],
    completedJobs: 89,
    reviews: [
      { id: '3', user: 'Lisa M.', rating: 5, comment: 'Got me the new iPhone on launch day!', date: '2024-01-10' }
    ],
    lastUpdate: new Date()
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    profileImage: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 5.0,
    hourlyRate: 35,
    location: { lat: 40.7614, lng: -73.9776, address: 'Bryant Park, NYC' },
    status: 'in-queue',
    queuePosition: 3,
    totalInQueue: 28,
    estimatedWait: 15,
    specialties: ['Food Trucks', 'Restaurants', 'Event Tickets'],
    completedJobs: 203,
    reviews: [
      { id: '4', user: 'David L.', rating: 5, comment: 'Perfect service, very communicative!', date: '2024-01-08' }
    ],
    nearFrontPhoto: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    lastUpdate: new Date()
  }
];

const mockHotspots: QueueHotspot[] = [
  { id: '1', name: 'DMV Office', location: { lat: 40.7589, lng: -73.9851 }, intensity: 0.9, queueCount: 45, averageWait: 120 },
  { id: '2', name: 'Apple Store 5th Ave', location: { lat: 40.7505, lng: -73.9934 }, intensity: 0.7, queueCount: 28, averageWait: 85 },
  { id: '3', name: 'Broadway Tickets', location: { lat: 40.7614, lng: -73.9776 }, intensity: 0.6, queueCount: 32, averageWait: 95 },
  { id: '4', name: 'Shake Shack', location: { lat: 40.7411, lng: -74.0020 }, intensity: 0.4, queueCount: 15, averageWait: 35 }
];

function App() {
  const [currentPage, setCurrentPage] = useState('splash');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedStander, setSelectedStander] = useState<Stander | null>(null);
  const [activeQueues, setActiveQueues] = useState<ActiveQueue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSmartMatch, setShowSmartMatch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLiveGPS, setShowLiveGPS] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<ActiveQueue | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [standerPosition, setStanderPosition] = useState({ lat: 40.7589, lng: -73.9851 });

  // Splash screen timer
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        setCurrentPage('home');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // GPS simulation updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate GPS updates and queue progress
      setActiveQueues(prev => prev.map(queue => ({
        ...queue,
        progress: Math.min(queue.progress + Math.random() * 5, 100),
        stander: {
          ...queue.stander,
          queuePosition: Math.max(queue.stander.queuePosition - (Math.random() > 0.7 ? 1 : 0), 1),
          estimatedWait: Math.max(queue.stander.estimatedWait - 1, 2),
          lastUpdate: new Date()
        }
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // GPS position updates for live tracking
  useEffect(() => {
    if (showLiveGPS) {
      const interval = setInterval(() => {
        setStanderPosition(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showLiveGPS]);

  const smartMatch = (location: string) => {
    setShowSmartMatch(true);
    setTimeout(() => {
      const bestStander = mockStanders.reduce((best, current) => 
        current.rating > best.rating ? current : best
      );
      addToQueue(bestStander);
      setShowSmartMatch(false);
    }, 3000);
  };
  const addToQueue = (stander: Stander) => {
    const newQueue: ActiveQueue = {
      id: Date.now().toString(),
      stander: { ...stander, status: 'in-queue' },
      startTime: new Date(),
      progress: 0,
      estimatedCompletion: new Date(Date.now() + stander.estimatedWait * 60000),
      status: 'active'
    };
    setActiveQueues(prev => [...prev, newQueue]);
    setCurrentPage('multi-queue');
  };

  const openChat = (queue: ActiveQueue) => {
    setSelectedQueue(queue);
    setShowChat(true);
    // Initialize with some mock messages
    setChatMessages([
      { id: '1', sender: 'stander', message: 'Hi! I\'m currently at position 8 in the queue. Will keep you updated!', timestamp: new Date(Date.now() - 300000) },
      { id: '2', sender: 'user', message: 'Thanks! How long do you think it will take?', timestamp: new Date(Date.now() - 240000) },
      { id: '3', sender: 'stander', message: 'Based on the current pace, about 20 more minutes. I\'ll send a photo when I\'m near the front!', timestamp: new Date(Date.now() - 180000) }
    ]);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: newMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate stander response
      setTimeout(() => {
        const responses = [
          'Got it! Will keep you posted.',
          'Thanks for the update!',
          'Moving up in the queue now!',
          'Almost there, just a few more people ahead.'
        ];
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'stander',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, response]);
      }, 2000);
    }
  };

  const openLiveGPS = (queue: ActiveQueue) => {
    setSelectedQueue(queue);
    setShowLiveGPS(true);
  };
  const renderPage = () => {
    if (showSplash) return <SplashScreen />;
    
    switch (currentPage) {
      case 'home': return <HomePage onSearch={setSearchQuery} onNavigate={setCurrentPage} onSmartMatch={smartMatch} />;
      case 'heatmap': return <HeatmapPage hotspots={mockHotspots} onNavigate={setCurrentPage} />;
      case 'standers': return <StandersPage standers={mockStanders} searchQuery={searchQuery} onSelectStander={setSelectedStander} onNavigate={setCurrentPage} />;
      case 'stander-detail': return selectedStander ? <StanderDetailPage stander={selectedStander} onHire={addToQueue} onNavigate={setCurrentPage} /> : <HomePage onSearch={setSearchQuery} onNavigate={setCurrentPage} />;
      case 'multi-queue': return <MultiQueuePage queues={activeQueues} onNavigate={setCurrentPage} onOpenChat={openChat} onOpenGPS={openLiveGPS} />;
      case 'payment': return <PaymentPage onNavigate={setCurrentPage} />;
      case 'profile': return <ProfilePage onNavigate={setCurrentPage} />;
      default: return <HomePage onSearch={setSearchQuery} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {!showSplash && <AppNavigation currentPage={currentPage} onNavigate={setCurrentPage} />}
      
      {/* Smart Match Modal */}
      {showSmartMatch && <SmartMatchModal />}
      
      {/* Chat Modal */}
      {showChat && selectedQueue && (
        <ChatModal 
          queue={selectedQueue} 
          messages={chatMessages}
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSendMessage={sendMessage}
          onClose={() => setShowChat(false)}
        />
      )}
      
      {/* Live GPS Modal */}
      {showLiveGPS && selectedQueue && (
        <LiveGPSModal 
          queue={selectedQueue}
          position={standerPosition}
          onClose={() => setShowLiveGPS(false)}
        />
      )}
      
      <div className="transition-all duration-500 ease-in-out">
        {renderPage()}
      </div>
    </div>
  );
}

// Smart Match Modal Component
function SmartMatchModal() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Finding your stander...</h2>
        <p className="text-gray-600 mb-4">Matching you with the best available stander in your area</p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Chat Modal Component
function ChatModal({ queue, messages, newMessage, onMessageChange, onSendMessage, onClose }: {
  queue: ActiveQueue;
  messages: ChatMessage[];
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img src={queue.stander.avatar} alt={queue.stander.name} className="w-10 h-10 rounded-full mr-3" />
            <div>
              <h3 className="font-semibold">{queue.stander.name}</h3>
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Online
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                message.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={onSendMessage}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Live GPS Modal Component
function LiveGPSModal({ queue, position, onClose }: {
  queue: ActiveQueue;
  position: { lat: number; lng: number };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img src={queue.stander.avatar} alt={queue.stander.name} className="w-10 h-10 rounded-full mr-3" />
            <div>
              <h3 className="font-semibold">{queue.stander.name} - Live GPS</h3>
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live tracking active
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Map */}
        <div className="flex-1 relative bg-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30"></div>
          
          {/* Simulated map with stander position */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Stander marker */}
              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-bounce">
                <div className="absolute -inset-2 bg-red-500/30 rounded-full animate-ping"></div>
              </div>
              
              {/* Queue location marker */}
              <div className="absolute -top-20 -left-10 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium shadow-lg whitespace-nowrap">
                  Queue Location
                </div>
              </div>
            </div>
          </div>
          
          {/* Street grid overlay */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="absolute bg-white" style={{
                left: `${i * 10}%`,
                top: 0,
                bottom: 0,
                width: '1px'
              }}></div>
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute bg-white" style={{
                top: `${i * 12.5}%`,
                left: 0,
                right: 0,
                height: '1px'
              }}></div>
            ))}
          </div>
        </div>
        
        {/* Stats */}
        <div className="p-4 bg-gray-50 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-indigo-600">Position {queue.stander.queuePosition}</div>
            <div className="text-sm text-gray-600">In Queue</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{queue.stander.estimatedWait} min</div>
            <div className="text-sm text-gray-600">Est. Wait</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">Live</div>
            <div className="text-sm text-gray-600">GPS Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// AppNavigation Component
function AppNavigation({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Rent-a-Queue
            </span>
          </div>
          
          <div className="flex space-x-6">
            <button 
              onClick={() => onNavigate('home')} 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('heatmap')} 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'heatmap' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Heatmap
            </button>
            <button 
              onClick={() => onNavigate('standers')} 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'standers' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Standers
            </button>
            <button 
              onClick={() => onNavigate('multi-queue')} 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'multi-queue' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              My Queues
            </button>
            <button 
              onClick={() => onNavigate('profile')} 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Splash Screen Component
function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center z-50">
      <div className="text-center animate-fade-in">
        <div className="mb-8 animate-bounce">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Users className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 animate-slide-up">
            Rent-a-Queue
          </h1>
        </div>
        <p className="text-2xl text-white/90 font-light animate-slide-up-delay">
          Skip the wait. Keep your day.
        </p>
        <div className="mt-12 flex justify-center">
          <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ onSearch, onNavigate, onSmartMatch }: { 
  onSearch: (query: string) => void; 
  onNavigate: (page: string) => void;
  onSmartMatch: (location: string) => void;
}) {
  const [searchLocation, setSearchLocation] = useState('');

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Skip the wait.<br />Keep your day.
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 animate-slide-up">
            Professional queue standers ready to wait in line for you
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-slide-up-delay">
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search by location (e.g., Times Square, NYC)"
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button 
                onClick={() => searchLocation ? onSmartMatch(searchLocation) : onNavigate('standers')}
                className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
              >
                {searchLocation ? 'Smart Match' : 'Find Standers'}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={() => onNavigate('heatmap')}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              View Queue Heatmap
            </button>
            <button 
              onClick={() => onNavigate('standers')}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              Browse Standers
            </button>
          </div>
        </div>
      </div>

      {/* Featured Standers */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Queue Standers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {mockStanders.slice(0, 3).map((stander, index) => (
              <div key={stander.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer animate-card-reveal"
                   style={{ animationDelay: `${index * 200}ms` }}
                   onClick={() => { onNavigate('stander-detail'); }}>
                <div className="relative">
                  <img src={stander.avatar} alt={stander.name} className="w-full h-48 object-cover" />
                  {stander.status === 'in-queue' && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                      In Queue
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{stander.name}</h3>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-600">{stander.rating} ({stander.completedJobs} jobs)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600">${stander.hourlyRate}/hr</span>
                    <span className="text-gray-500">{stander.location.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Heatmap Page Component
function HeatmapPage({ hotspots, onNavigate }: { hotspots: QueueHotspot[]; onNavigate: (page: string) => void }) {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Queue Heatmap</h1>
        
        {/* Map Container */}
        <div className="bg-gray-900 rounded-2xl h-96 mb-8 relative overflow-hidden">
          {/* Realistic city map background */}
          <div className="absolute inset-0 opacity-30">
            <div className="grid grid-cols-12 grid-rows-8 h-full">
              {[...Array(96)].map((_, i) => (
                <div key={i} className="border border-gray-600/20"></div>
              ))}
            </div>
          </div>
          
          {/* Street overlay */}
          <div className="absolute inset-0">
            {/* Horizontal streets */}
            <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-600/40"></div>
            <div className="absolute top-2/4 left-0 right-0 h-1 bg-gray-600/40"></div>
            <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-600/40"></div>
            
            {/* Vertical streets */}
            <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-600/40"></div>
            <div className="absolute left-2/4 top-0 bottom-0 w-1 bg-gray-600/40"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-600/40"></div>
          </div>
          
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              onClick={() => onNavigate('standers')}
            >
              {/* Glow effect */}
              <div 
                className="w-12 h-12 rounded-full animate-pulse"
                style={{
                  backgroundColor: `rgba(${255 * hotspot.intensity}, ${150 * (1 - hotspot.intensity)}, 50, 0.6)`,
                  boxShadow: `0 0 ${30 * hotspot.intensity}px rgba(${255 * hotspot.intensity}, ${150 * (1 - hotspot.intensity)}, 50, 0.8)`
                }}
              ></div>
              
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
              
              {/* Tooltip */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white rounded-lg px-3 py-2 text-xs font-medium shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="font-semibold">{hotspot.name}</div>
                <div className="text-gray-300">{hotspot.queueCount} people • {hotspot.averageWait}min wait</div>
              </div>
            </div>
          ))}
        </div>

        {/* Hotspot List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hotspots.map((hotspot, index) => (
            <div key={hotspot.id} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer animate-card-reveal"
                 style={{ animationDelay: `${index * 100}ms` }}
                 onClick={() => onNavigate('standers')}>
              <h3 className="font-semibold text-gray-800 mb-2">{hotspot.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Queue Length:</span>
                  <span className="font-medium">{hotspot.queueCount} people</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Wait:</span>
                  <span className="font-medium">{hotspot.averageWait} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Intensity:</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-red-500 rounded-full"
                      style={{ width: `${hotspot.intensity * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Standers Page Component
function StandersPage({ standers, searchQuery, onSelectStander, onNavigate }: {
  standers: Stander[];
  searchQuery: string;
  onSelectStander: (stander: Stander) => void;
  onNavigate: (page: string) => void;
}) {
  const filteredStanders = standers.filter(stander =>
    searchQuery === '' || stander.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Available Queue Standers</h1>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredStanders.map((stander, index) => (
            <div key={stander.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer animate-card-reveal"
                 style={{ animationDelay: `${index * 150}ms` }}
                 onClick={() => { onSelectStander(stander); onNavigate('stander-detail'); }}>
              <div className="flex">
                <img src={stander.avatar} alt={stander.name} className="w-24 h-24 object-cover" />
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{stander.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{stander.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {stander.location.address}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {stander.status === 'in-queue' ? `Position ${stander.queuePosition}/${stander.totalInQueue} • ${stander.estimatedWait} min wait` : 'Available now'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-indigo-600">${stander.hourlyRate}/hr</span>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        stander.status === 'available' ? 'bg-green-100 text-green-800' :
                        stander.status === 'in-queue' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {stander.status === 'available' ? 'Available' :
                         stander.status === 'in-queue' ? 'In Queue' : 'Busy'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stander Detail Page Component
function StanderDetailPage({ stander, onHire, onNavigate }: {
  stander: Stander;
  onHire: (stander: Stander) => void;
  onNavigate: (page: string) => void;
}) {
  const [aiWaitTime, setAiWaitTime] = useState(stander.estimatedWait);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiWaitTime(prev => Math.max(prev - 1, 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 animate-slide-down">
          <div className="relative">
            <img src={stander.profileImage} alt={stander.name} className="w-full h-64 object-cover" />
            <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{stander.rating}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{stander.name}</h1>
            <div className="flex items-center mb-4 text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {stander.location.address}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600">{stander.completedJobs}</div>
                <div className="text-sm text-gray-600">Jobs Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">${stander.hourlyRate}/hr</div>
                <div className="text-sm text-gray-600">Hourly Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{stander.rating}/5</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Wait Time Widget */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 mb-6 animate-slide-up">
          <h2 className="text-xl font-semibold mb-2">🤖 AI Wait Time Prediction</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{aiWaitTime} min</div>
              <div className="text-indigo-100">Estimated wait time</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-indigo-100">Queue Position</div>
              <div className="text-2xl font-bold">{stander.queuePosition}/{stander.totalInQueue}</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((stander.totalInQueue - stander.queuePosition) / stander.totalInQueue) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Photo Proof */}
        {stander.nearFrontPhoto && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">📸 Live Photo Proof</h2>
            <img src={stander.nearFrontPhoto} alt="Near front of queue" className="w-full h-48 object-cover rounded-xl mb-2" />
            <p className="text-gray-600 text-sm">📍 Near front of queue • Updated 2 minutes ago</p>
          </div>
        )}

        {/* Hire Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <button 
              onClick={() => onHire(stander)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg transform hover:scale-105"
            >
              🚀 Instant Swap - $20/hr
            </button>
            <p className="text-gray-500 text-sm mt-2">✅ Queue Guarantee • 💰 No upfront payment</p>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
          <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {stander.reviews.map((review) => (
              <div key={review.id} className="border-l-4 border-indigo-500 pl-4">
                <div className="flex items-center mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="ml-2 font-medium">{review.user}</span>
                  <span className="ml-2 text-gray-500 text-sm">{review.date}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Multi-Queue Page Component
function MultiQueuePage({ queues, onNavigate, onOpenChat, onOpenGPS }: { 
  queues: ActiveQueue[]; 
  onNavigate: (page: string) => void;
  onOpenChat: (queue: ActiveQueue) => void;
  onOpenGPS: (queue: ActiveQueue) => void;
}) {
  if (queues.length === 0) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Active Queues</h2>
          <p className="text-gray-600 mb-6">Start by hiring a queue stander to see your progress here</p>
          <button 
            onClick={() => onNavigate('standers')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Find Standers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Active Queues</h1>
        
        <div className="space-y-6">
          {queues.map((queue, index) => (
            <div key={queue.id} className="bg-white rounded-2xl shadow-lg p-6 animate-card-reveal"
                 style={{ animationDelay: `${index * 200}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <img src={queue.stander.avatar} alt={queue.stander.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold">{queue.stander.name}</h3>
                    <p className="text-gray-600">{queue.stander.location.address}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm text-gray-500">Live tracking active</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">Position {queue.stander.queuePosition}</div>
                  <div className="text-gray-500">of {queue.stander.totalInQueue}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(queue.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${queue.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="font-medium">{queue.stander.estimatedWait} min</div>
                  <div className="text-sm text-gray-500">Est. Wait</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="font-medium">Live</div>
                  <div className="text-sm text-gray-500">GPS Track</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Star className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="font-medium">{queue.stander.rating}</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="font-medium">${queue.stander.hourlyRate}</div>
                  <div className="text-sm text-gray-500">Per Hour</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  onClick={() => onOpenChat(queue)}
                  Message Stander
                </button>
                <button className="flex-1 py-2 px-4 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                  onClick={() => onOpenGPS(queue)}
                  View Live GPS
                </button>
                {queue.progress > 85 && (
                  <button 
                    onClick={() => onNavigate('payment')}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all animate-bounce"
                  >
                    Ready to Swap!
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Payment Page Component
function PaymentPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onNavigate('profile');
    }, 3000);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-down">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Secure Checkout</h1>
          
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Queue Standing Service</span>
                <span>$25.00</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>$2.50</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>$27.50</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <div className="p-4 border border-indigo-300 rounded-xl bg-indigo-50 cursor-pointer">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-indigo-600 mr-3" />
                  <span className="font-medium">Credit Card</span>
                  <div className="ml-auto flex space-x-2">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">VISA</div>
                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">MC</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-600 rounded mr-3"></div>
                  <span>PayPal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input type="text" placeholder="1234 5678 9012 3456" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="text" placeholder="MM/YY" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input type="text" placeholder="123" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">🔒 Your payment is secured with 256-bit SSL encryption</p>
          </div>

          {/* Pay Button */}
          <button 
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-4 rounded-xl text-white text-lg font-semibold transition-all ${
              processing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              'Complete Payment - $27.50'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile Page Component
function ProfilePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const mockUserData = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    memberSince: '2023',
    totalHires: 24,
    moneySaved: 847,
    favoriteStanders: 3
  };

  const mockHistory = [
    { id: '1', stander: 'Sarah Chen', location: 'DMV Office', date: '2024-01-15', duration: 120, cost: 50, rating: 5 },
    { id: '2', stander: 'Marcus Johnson', location: 'Apple Store', date: '2024-01-10', duration: 85, cost: 42.50, rating: 5 },
    { id: '3', stander: 'Emily Rodriguez', location: 'Broadway Tickets', date: '2024-01-05', duration: 95, cost: 55.75, rating: 4 }
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white p-8 mb-8 animate-slide-down">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{mockUserData.name}</h1>
              <p className="text-indigo-100">{mockUserData.email}</p>
              <p className="text-indigo-200">Member since {mockUserData.memberSince}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center animate-card-reveal">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{mockUserData.totalHires}</div>
            <div className="text-gray-600">Total Hires</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center animate-card-reveal" style={{ animationDelay: '200ms' }}>
            <div className="text-3xl font-bold text-green-600 mb-2">${mockUserData.moneySaved}</div>
            <div className="text-gray-600">Time Saved Value</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center animate-card-reveal" style={{ animationDelay: '400ms' }}>
            <div className="text-3xl font-bold text-purple-600 mb-2">{mockUserData.favoriteStanders}</div>
            <div className="text-gray-600">Favorite Standers</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Recent Queue History</h2>
          <div className="space-y-4">
            {mockHistory.map((hire, index) => (
              <div key={hire.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all animate-fade-in"
                   style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{hire.stander}</h3>
                    <p className="text-gray-600">{hire.location}</p>
                    <p className="text-sm text-gray-500">{hire.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-indigo-600">${hire.cost}</div>
                    <div className="text-sm text-gray-500">{hire.duration} minutes saved</div>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < hire.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;