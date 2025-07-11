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
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Bảng điều khiển phụ huynh
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Quản lý sức khỏe và theo dõi con em của bạn một cách hiệu quả
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`group relative p-4 sm:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? "bg-white shadow-xl ring-2 ring-blue-500/20 scale-105" 
                      : "bg-white/70 shadow-md hover:shadow-lg hover:bg-white"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4 flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} shadow-lg` 
                        : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:" + tab.color
                    }`}>
                      <Icon className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-white"} transition-colors duration-300`} size={20} />
                    </div>
                    <h3 className={`font-semibold text-xs sm:text-sm mb-1 sm:mb-2 transition-colors duration-300 ${
                      isActive ? "text-blue-600" : "text-gray-800"
                    }`}>
                      {tab.label}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed hidden sm:block">
                      {tab.description}
                    </p>
                    {tab.key === "notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content Header */}
          {activeTabData && (
            <div ref={headerRef} className="mb-6 bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${activeTabData.color} flex items-center justify-center shadow-lg`}>
                  <activeTabData.icon className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                    {activeTabData.label}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {activeTabData.description}
                  </p>
                </div>
                <div className={`hidden sm:block w-1 h-12 bg-gradient-to-b ${activeTabData.color} rounded-full`}></div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div ref={contentRef} className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default ParentDashboardPage;