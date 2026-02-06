
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import {
  Car, Wrench, User as UserIcon, Settings, LogOut,
  MapPin, Bell, ShieldCheck, Menu, X, Users,
  ChevronLeft, ChevronRight, Edit2, Trash2, Save, Mail, Phone, Calendar,
  Activity, FileText, Info, List, Camera, CheckCircle
} from 'lucide-react';
import { UserRole, Driver } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';
import DriverPortal from './pages/DriverPortal';
import CarRental from './pages/CarRental';
import ServiceBooking from './pages/ServiceBooking';
import Tracking from './pages/Tracking';
import UserProfile from './pages/UserProfile';
import UserBooking from './pages/UserBooking';


const SidebarLink = ({ to, icon: Icon, label, collapsed, onClick }: { to: string; icon: any; label: string; collapsed: boolean; onClick: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : ''}
      className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-5 space-x-3'} py-3 mx-3 my-1 rounded-xl transition-all duration-300 relative group overflow-hidden ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon size={20} className={`min-w-[20px] z-10 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
      <span className={`font-medium whitespace-nowrap z-10 transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 z-0"></div>
      )}
    </Link>
  );
};

const LogoutModal = ({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-center">
          <LogOut className="text-red-500 mr-2" size={20} />
          <h3 className="font-bold text-lg text-gray-900">Confirm Logout</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">Are you sure you want to logout?</p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button onClick={onCancel} className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center">
              <X size={16} className="mr-2" />
              Cancel
            </button>
            <button onClick={onConfirm} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-all text-sm font-medium flex items-center justify-center">
              <CheckCircle size={16} className="mr-2" />
              Sure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { currentUser, updateCurrentUser, logout } = useApp();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar,
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    bio: currentUser.bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Preset Avatars for quick selection
  const presetAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Scooby'
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bio: currentUser.bio || ''
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate network delay for "database" save
    setTimeout(() => {
      updateCurrentUser(formData);
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deleted.");
      logout();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-900">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer">
               <img 
                 src={formData.avatar} 
                 alt="Profile" 
                 className="w-24 h-24 rounded-full border-4 border-indigo-100 object-cover bg-gray-100" 
                 onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
               />
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
               </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 font-medium">Choose an avatar or paste a URL</p>
            
            {/* Quick Select Presets */}
            <div className="flex gap-2 mt-2">
               {presetAvatars.map((url, idx) => (
                 <button
                   key={idx}
                   type="button"
                   onClick={() => setFormData({...formData, avatar: url})}
                   className={`w-8 h-8 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${formData.avatar === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200'}`}
                 >
                   <img src={url} alt={`Avatar ${idx}`} className="w-full h-full" />
                 </button>
               ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
             <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                  required
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
             <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                  required
                />
             </div>
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (Custom)</label>
             <input 
               type="text" 
               value={formData.avatar}
               onChange={(e) => setFormData({...formData, avatar: e.target.value})}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white text-black"
               placeholder="https://example.com/image.jpg"
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                  placeholder="+1 (555) 000-0000"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                  placeholder="123 Main St, City"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <div className="relative">
                <Info size={16} className="absolute left-3 top-3 text-gray-400" />
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white h-24 resize-none text-black"
                  placeholder="Tell us a little about yourself..."
                />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-100 mt-2">
             <button 
               type="button" 
               onClick={handleDeleteAccount}
               className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center text-sm font-medium"
             >
               <Trash2 size={16} className="mr-2" /> Delete
             </button>
             <div className="flex-1"></div>
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
             >
               Cancel
             </button>
             <button 
               type="submit" 
               disabled={isSaving}
               className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all text-sm font-medium flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isSaving ? (
                 <>Saving...</>
               ) : (
                 <><Save size={16} className="mr-2" /> Save Changes</>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Toast Component for Notifications
const ToastNotification = () => {
  const { notifications } = useApp();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  
  // Track the last message ID to detect changes
  const lastMessageIdRef = useRef('');

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotif = notifications[0];
      // Only show if it's a new message
      if (latestNotif.id !== lastMessageIdRef.current) {
        setMessage(latestNotif.message);
        setShow(true);
        lastMessageIdRef.current = latestNotif.id;
        
        const timer = setTimeout(() => setShow(false), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!show) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
      <div className="bg-white px-6 py-4 rounded-xl shadow-2xl border border-gray-100 flex items-center gap-3 min-w-[320px]">
         <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <CheckCircle size={20} />
         </div>
         <div>
            <h4 className="text-sm font-bold text-gray-900">Notification</h4>
            <p className="text-sm text-gray-600">{message}</p>
         </div>
         <button onClick={() => setShow(false)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X size={16} />
         </button>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { role, currentUser, notifications, logout, clearNotifications, removeNotification, isEditProfileOpen, openEditProfile, closeEditProfile } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Dropdown States
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileOpen(!isMobileOpen);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">
      {/* Dynamic Toast Notification */}
      <ToastNotification />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none
            ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
            ${isCollapsed ? 'md:w-20' : 'md:w-64'}
            overflow-hidden whitespace-nowrap`}
        >
          <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} bg-gray-900/50 backdrop-blur-sm relative transition-all duration-300`}>
            <div className="flex items-center space-x-3 overflow-hidden">
              <Car className="text-indigo-500 min-w-[28px]" size={28} />
              <h1 className={`text-xl font-bold tracking-tight transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                Car Service
              </h1>
            </div>
            {!isCollapsed && (
               <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                 <X size={24} />
               </button>
            )}
          </div>

          <nav className="flex-1 mt-4 overflow-y-auto scrollbar-hide py-2">
            {role === UserRole.USER && (
              <>
                <SidebarLink to="/" icon={UserIcon} label="Dashboard" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/rentals" icon={Car} label="Rent a Car" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/bookings" icon={List} label="My Bookings" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/services" icon={Wrench} label="Book Service" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/profile" icon={Settings} label="Profile" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
              </>
            )}
            {role === UserRole.ADMIN && (
              <>
                <SidebarLink to="/admin" icon={Activity} label="Overview" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/admin/bookings" icon={FileText} label="Bookings" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/admin/fleet" icon={Car} label="Fleet" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/admin/users" icon={Users} label="Users" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/admin/tracking" icon={MapPin} label="Tracking" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
              </>
            )}
            {role === UserRole.DRIVER && (
              <>
                <SidebarLink to="/driver" icon={Car} label="My Trips" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
                <SidebarLink to="/driver/profile" icon={UserIcon} label="Profile" collapsed={isCollapsed} onClick={() => setIsMobileOpen(false)} />
              </>
            )}
          </nav>

          {/* User Info Footer */}
          <div className={`p-4 border-t border-gray-800 bg-gray-900 transition-all duration-300 ${isCollapsed ? 'items-center justify-center' : ''}`}>
             <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4 transition-all duration-300`}>
               <div className="relative group cursor-pointer" onClick={openEditProfile}>
                 <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover bg-gray-700" />
                 <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={12} className="text-white" />
                 </div>
               </div>

               <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                 <p className="text-sm font-medium truncate w-32">{currentUser.name}</p>
                 <p className="text-xs text-gray-400 capitalize">{role.toLowerCase()}</p>
               </div>
             </div>

           <button
             onClick={handleLogoutClick}
             title={isCollapsed ? "Logout" : ""}
             className={`flex items-center justify-center ${isCollapsed ? 'bg-transparent text-gray-400 hover:text-red-500' : 'w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg space-x-2'} transition-colors text-sm font-medium`}
           >
             <LogOut size={20} />
             {!isCollapsed && <span>Logout</span>}
           </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <header className="bg-white shadow-sm z-10 px-6 py-3 flex items-center justify-between h-16">
             <div className="flex items-center">
               <button onClick={toggleSidebar} className="mr-4 text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
                 <Menu size={24} />
               </button>
               <h2 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
                 {role === UserRole.ADMIN ? 'Admin Dashboard' : role === UserRole.DRIVER ? 'Driver Portal' : 'Car Service Pro'}
               </h2>
             </div>

             <div className="flex items-center space-x-3">
               {/* Notification Center */}
               <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fade-in-up overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {notifications.length > 0 && (
                          <button onClick={clearNotifications} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start justify-between group">
                               <div className="flex items-start pr-2">
                                 <div className="min-w-[8px] h-2 w-2 rounded-full bg-indigo-500 mt-1.5 mr-3 flex-shrink-0"></div>
                                 <p className="text-sm text-gray-600 leading-snug">{notif.message}</p>
                               </div>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   removeNotification(notif.id);
                                 }}
                                 className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                 title="Dismiss"
                               >
                                 <X size={14} />
                               </button>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-400 text-sm">
                             <Bell size={24} className="mx-auto mb-2 opacity-20" />
                             No new notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
               </div>

               {/* Profile Dropdown */}
               <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full border border-gray-200 object-cover hover:ring-2 hover:ring-indigo-100 transition-all bg-gray-100" />
                    <div className="hidden sm:block text-left">
                       <p className="text-sm font-medium text-gray-700 leading-none">{currentUser.name}</p>
                       <p className="text-xs text-gray-400 mt-0.5 capitalize">{role.toLowerCase()}</p>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fade-in-up overflow-hidden">
                       <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                       </div>
                       <div className="py-1">
                          <button
                            onClick={() => { openEditProfile(); setShowProfileMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center"
                          >
                             <Edit2 size={16} className="mr-2" /> Edit Profile
                          </button>
                          <button
                            onClick={() => { openEditProfile(); setShowProfileMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center"
                          >
                             <Settings size={16} className="mr-2" /> Settings
                          </button>
                       </div>
                       <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogoutClick}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                           <LogOut size={16} className="mr-2" /> Logout
                        </button>
                       </div>
                    </div>
                  )}
               </div>
             </div>
          </header>

          <div className="flex-1 overflow-auto p-6 scroll-smooth relative">
             {children}
          </div>

        </main>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between text-xs text-gray-500">
         <p>&copy; 2025 Car Service Pro. All rights reserved.</p>
         <div className="space-x-4 mt-2 sm:mt-0">
           <a href="#" className="hover:text-gray-900">Privacy</a>
           <a href="#" className="hover:text-gray-900">Terms</a>
           <a href="#" className="hover:text-gray-900">Support</a>
         </div>
      </div>

      {/* Edit Profile Modal wired to context */}
      <EditProfileModal isOpen={isEditProfileOpen} onClose={closeEditProfile} />

      {/* Logout Modal */}
      <LogoutModal isOpen={showLogoutModal} onConfirm={confirmLogout} onCancel={cancelLogout} />

      {/* Mobile Overlay for Sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </div>
  );
};

const AppRoutes = () => {
  const { role } = useApp();

  return (
    <Routes>
      {/* User Routes */}
      {role === UserRole.USER && (
        <>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/rentals" element={<CarRental />} />
          <Route path="/bookings" element={<UserBooking />} />
          <Route path="/services" element={<ServiceBooking />} />
          <Route path="/tracking/:bookingId" element={<Tracking />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}

      {/* Admin Routes */}
      {role === UserRole.ADMIN && (
        <>
          <Route path="/admin" element={<AdminPanel activeTab="overview" />} />
          <Route path="/admin/bookings" element={<AdminPanel activeTab="bookings" />} />
          <Route path="/admin/fleet" element={<AdminPanel activeTab="fleet" />} />
          <Route path="/admin/users" element={<AdminPanel activeTab="users" />} />
          <Route path="/admin/tracking" element={<AdminPanel activeTab="tracking" />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      )}

      {/* Driver Routes */}
      {role === UserRole.DRIVER && (
        <>
          <Route path="/driver" element={<DriverPortal />} />
          <Route path="/driver/profile" element={<DriverPortal activeTab="profile" />} />
          <Route path="*" element={<Navigate to="/driver" replace />} />
        </>
      )}
    </Routes>
  );
};

const MainWrapper = () => {
  const { isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
         <MainWrapper />
      </HashRouter>
    </AppProvider>
  );
}
