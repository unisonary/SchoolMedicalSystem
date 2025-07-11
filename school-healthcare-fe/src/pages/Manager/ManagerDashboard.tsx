import { useEffect, useState, useRef } from "react";
import { ClipboardCheck, Users, BarChart2, Bell } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

// 👉 Component con sẽ được tạo sau
import ManagerMedicalPlans from "./ManagerMedicalPlans";
import ManagerAssignments from "./ManagerAssignment";
import ManagerReports from "./ManagerReports";
import ManagerNotifications from "./ManagerNotifications";

const tabs = [
  {
    key: "plans",
    label: "Kế hoạch y tế",
    icon: ClipboardCheck,
    color: "from-blue-500 to-cyan-500",
    description: "Tạo, chỉnh sửa và quản lý các kế hoạch khám sức khỏe và tiêm chủng"
  },
  {
    key: "assignments",
    label: "Phân công",
    icon: Users,
    color: "from-green-500 to-emerald-500",
    description: "Phân công y tá và học sinh cho từng kế hoạch y tế"
  },
  {
    key: "reports",
    label: "Báo cáo",
    icon: BarChart2,
    color: "from-indigo-500 to-purple-500",
    description: "Xem thống kê tiêm chủng, khám sức khoẻ và tồn kho vật tư"
  },
  {
    key: "notifications",
    label: "Thông báo",
    icon: Bell,
    color: "from-orange-500 to-yellow-400",
    description: "Nhận cảnh báo vật tư y tế gần hết hoặc sắp hết hạn"
  }
];

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("manager-tab") || "plans");
  const [key, setKey] = useState(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem("manager-tab", key);
    
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

  useEffect(() => {
    const stored = localStorage.getItem("manager-tab") || "plans";
    setActiveTab(stored);
  }, [key]);

  useEffect(() => {
    const syncTab = () => setKey(Date.now());
    window.addEventListener("storage", syncTab);
    return () => window.removeEventListener("storage", syncTab);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "plans": return <ManagerMedicalPlans />;
      case "assignments": return <ManagerAssignments />;
      case "reports": return <ManagerReports />;
      case "notifications": return <ManagerNotifications />;
      default: return <div className="text-gray-600">Vui lòng chọn chức năng</div>;
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
              Bảng điều khiển quản lý
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Quản lý kế hoạch y tế, phân công nhân sự và theo dõi báo cáo một cách hiệu quả
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
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

export default ManagerDashboard;