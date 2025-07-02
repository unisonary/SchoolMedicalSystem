import { useAuthStore } from "@/auth/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { User, Activity, Pill, FileCheck, TrendingUp, Bell, Lock, LogOut, ChevronDown } from "lucide-react";

const UserDropdownMenu = () => {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const jumpToTab = (tab: string) => {
    localStorage.setItem("parent-tab", tab);
    window.dispatchEvent(new Event("storage")); // trigger re-render
    navigate("/parent/dashboard");
    setOpen(false);
  };

  const isParent = user?.role === "Parent";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const menuItems = [
    ...(isParent ? [
      {
        icon: User,
        label: "Hồ sơ của tôi",
        action: () => {
          navigate("/parent/profile");
          setOpen(false);
        },
        color: "text-blue-600",
        bgHover: "hover:bg-blue-50"
      },
      {
        icon: Activity,
        label: "Hồ sơ sức khỏe",
        action: () => jumpToTab("conditions"),
        color: "text-blue-600",
        bgHover: "hover:bg-blue-50"
      },
      {
        icon: Pill,
        label: "Gửi thuốc",
        action: () => jumpToTab("medications"),
        color: "text-green-600",
        bgHover: "hover:bg-green-50"
      },
      {
        icon: FileCheck,
        label: "Xác nhận kế hoạch",
        action: () => jumpToTab("consent"),
        color: "text-purple-600",
        bgHover: "hover:bg-purple-50"
      },
      {
        icon: TrendingUp,
        label: "Theo dõi sức khỏe",
        action: () => jumpToTab("progress"),
        color: "text-orange-600",
        bgHover: "hover:bg-orange-50"
      },
      {
        icon: Bell,
        label: "Thông báo y tế",
        action: () => jumpToTab("notifications"),
        color: "text-pink-600",
        bgHover: "hover:bg-pink-50"
      }
    ] : []),
    {
      icon: Lock,
      label: "Đổi mật khẩu",
      action: () => {
        navigate("/login/change-password");
        setOpen(false);
      },
      color: "text-gray-600",
      bgHover: "hover:bg-gray-50"
    },
    {
      icon: LogOut,
      label: "Đăng xuất",
      action: handleLogout,
      color: "text-red-600",
      bgHover: "hover:bg-red-50",
      isLogout: true
    }
  ];

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`group relative flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
          open 
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg" 
            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105"
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold text-sm">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:block font-medium text-sm">
            {user?.username}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} 
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.username}</p>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 max-h-80 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isLastBeforeLogout = index === menuItems.length - 2;
              
              return (
                <div key={index}>
                  <button
                    onClick={item.action}
                    className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all duration-200 ${
                      item.bgHover
                    } group`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      item.isLogout 
                        ? "bg-red-100 group-hover:bg-red-200" 
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}>
                      <Icon size={16} className={`${item.color} transition-colors duration-200`} />
                    </div>
                    <span className={`font-medium transition-colors duration-200 ${
                      item.isLogout ? "text-red-600" : "text-gray-700 group-hover:text-gray-900"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                  {isLastBeforeLogout && (
                    <div className="mx-6 my-2 border-t border-gray-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdownMenu;