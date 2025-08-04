import { useEffect, useState, useRef } from "react";
import { Activity, Pill, FileCheck, TrendingUp, Bell } from "lucide-react";
import MedicalConditions from "./MedicalConditions";
import Medications from "./Medications";
import ConsentTab from "./ConsentTab";
import Progress from "./Progress";
import Notifications from "./Notifications";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import MainLayout from "@/layouts/MainLayout";

const tabs = [
  { key: "conditions", label: "Hồ sơ sức khỏe", icon: Activity, color: "from-blue-500 to-cyan-500", description: "Quản lý tình trạng y tế của con" },
  { key: "medications", label: "Gửi thuốc", icon: Pill, color: "from-green-500 to-emerald-500", description: "Gửi yêu cầu cho con uống thuốc" },
  { key: "consent", label: "Xác nhận kế hoạch", icon: FileCheck, color: "from-purple-500 to-violet-500", description: "Phê duyệt các kế hoạch y tế" },
  { key: "progress", label: "Theo dõi sức khỏe", icon: TrendingUp, color: "from-orange-500 to-red-500", description: "Xem báo cáo sức khỏe con" },
  { key: "notifications", label: "Thông báo y tế", icon: Bell, color: "from-pink-500 to-rose-500", description: "Các thông báo quan trọng" },
];

const ParentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("parent-tab") || "conditions");
  const [key, setKey] = useState(Date.now()); // force re-render
  const [unreadCount, setUnreadCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem("parent-tab", key);
    
    // Smooth scroll to content section
    setTimeout(() => {
      if (contentRef.current && headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const targetPosition = headerRef.current.offsetTop + headerHeight - 20; // 20px offset for better spacing
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure content is rendered
  };

  const fetchUnread = async () => {
    try {
      const res = await axios.get("/parent/student/notifications");
      const count = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(count);
    } catch {
      toast.error("Không thể lấy số lượng thông báo.");
    }
  };

  useEffect(() => {
    const tab = localStorage.getItem("parent-tab") || "conditions";
    setActiveTab(tab);
  }, [key]);

  useEffect(() => {
    const syncTab = () => setKey(Date.now());
    window.addEventListener("storage", syncTab);
    return () => window.removeEventListener("storage", syncTab);
  }, []);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchUnread();
    }
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "conditions": return <MedicalConditions />;
      case "medications": return <Medications />;
      case "consent": return <ConsentTab />;
      case "progress": return <Progress />;
      case "notifications": return <Notifications onRead={fetchUnread} />;
      default: return <div>Chọn một mục để hiển thị</div>;
    }
  };

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen">
      <MainLayout key={key}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Hero Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg animate-pulse">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Bảng điều khiển phụ huynh
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Quản lý sức khỏe và theo dõi con em của bạn một cách hiệu quả và an toàn nhất
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Hệ thống hoạt động bình thường</span>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-10">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={`group relative p-5 sm:p-7 rounded-3xl transition-all duration-500 transform hover:scale-110 animate-fade-in ${
                    isActive 
                      ? "bg-white shadow-2xl ring-4 ring-blue-500/20 scale-110" 
                      : "bg-white/80 shadow-lg hover:shadow-2xl hover:bg-white backdrop-blur-sm"
                  }`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} rounded-3xl opacity-0 group-hover:opacity-15 transition-all duration-500`}></div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-b ${tab.color} rounded-full`}></div>
                  )}
                  
                  <div className="relative">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-4 sm:mb-5 flex items-center justify-center transition-all duration-500 transform group-hover:rotate-6 ${
                      isActive 
                        ? `bg-gradient-to-br ${tab.color} shadow-xl` 
                        : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:" + tab.color.replace('to-', 'to-')
                    }`}>
                      <Icon className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-white"} transition-all duration-500`} size={22} />
                    </div>
                    
                    <h3 className={`font-bold text-sm sm:text-base mb-2 transition-all duration-300 ${
                      isActive ? "text-blue-700" : "text-gray-800 group-hover:text-gray-900"
                    }`}>
                      {tab.label}
                    </h3>
                    
                    <p className="text-xs text-gray-500 leading-relaxed hidden sm:block group-hover:text-gray-600 transition-colors duration-300">
                      {tab.description}
                    </p>
                    
                    {/* Notification badge */}
                    {tab.key === "notifications" && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Enhanced Content Header */}
          {activeTabData && (
            <div ref={headerRef} className="mb-8 bg-gradient-to-r from-white via-gray-50 to-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 overflow-hidden relative">
              {/* Background decorations */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${activeTabData.color} opacity-5 rounded-full transform translate-x-16 -translate-y-16`}></div>
              <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${activeTabData.color} opacity-5 rounded-full transform -translate-x-12 translate-y-12`}></div>
              
              <div className="flex items-center space-x-4 sm:space-x-6 relative">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${activeTabData.color} flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                  <activeTabData.icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    {activeTabData.label}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {activeTabData.description}
                  </p>
                </div>
                <div className={`hidden sm:block w-2 h-16 bg-gradient-to-b ${activeTabData.color} rounded-full shadow-lg`}></div>
              </div>
            </div>
          )}

          {/* Enhanced Tab Content */}
          <div ref={contentRef} className="animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm">
              <div className="relative">
                {/* Top accent line */}
                {activeTabData && (
                  <div className={`h-1 bg-gradient-to-r ${activeTabData.color}`}></div>
                )}
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default ParentDashboardPage;