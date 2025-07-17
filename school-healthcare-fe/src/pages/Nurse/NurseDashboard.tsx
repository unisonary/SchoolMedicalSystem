import { useEffect, useState, useRef } from "react";
import {
  FilePlus2,
  Pill,
  Boxes,
  ClipboardList,
  Stethoscope,
  Syringe,
  CalendarClock,
  HeartPulse,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

// 👉 Sẽ tạo các component này sau
import NurseMedicalEvents from "./NurseMedicalEvents";
import NurseMedications from "./NurseMedications";
import NurseInventory from "./NurseInventory";
import NurseSupplyLog from "./NurseSupplyLog";
import NurseHealthCheckup from "./NurseHealthCheckup";
import NurseVaccinations from "./NurseVaccinations";
import NurseAppointments from "./NurseAppointments";
import NurseMedicalCondition from "./NurseMedicalCondition";

const tabs = [
  { key: "events", label: "Sự kiện y tế", icon: FilePlus2, color: "from-blue-500 to-cyan-500", description: "Ghi nhận và xử lý sự kiện y tế" },
  { key: "medicalcondition", label: "Tình trạng sức khỏe", icon: HeartPulse, color: "from-red-500 to-rose-500", description: "Xem tình trạng sức khỏe học sinh" },
  { key: "medications", label: "Xử lý thuốc", icon: Pill, color: "from-green-500 to-emerald-500", description: "Xử lý thuốc phụ huynh gửi" },
  { key: "inventory", label: "Kho vật tư", icon: Boxes, color: "from-purple-500 to-violet-500", description: "Quản lý vật tư y tế và thuốc" },
  { key: "supplylog", label: "Xuất vật tư", icon: ClipboardList, color: "from-orange-500 to-yellow-500", description: "Ghi nhận vật tư đã dùng" },
  { key: "checkup", label: "Khám sức khỏe", icon: Stethoscope, color: "from-teal-500 to-blue-500", description: "Cập nhật kết quả khám sức khỏe" },
  { key: "vaccination", label: "Tiêm chủng", icon: Syringe, color: "from-pink-500 to-red-500", description: "Cập nhật kết quả tiêm chủng" },
  { key: "appointments", label: "Lịch tư vấn", icon: CalendarClock, color: "from-gray-500 to-zinc-500", description: "Xem và xử lý lịch tư vấn" },
];

const NurseDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("nurse-tab") || "events");
  const [key, setKey] = useState(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem("nurse-tab", key);

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
    const tab = localStorage.getItem("nurse-tab") || "events";
    setActiveTab(tab);
  }, [key]);

  useEffect(() => {
    const syncTab = () => setKey(Date.now());
    window.addEventListener("storage", syncTab);
    return () => window.removeEventListener("storage", syncTab);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "events": return <NurseMedicalEvents />;
      case "medications": return <NurseMedications />;
      case "inventory": return <NurseInventory />;
      case "supplylog": return <NurseSupplyLog />;
      case "checkup": return <NurseHealthCheckup />;
      case "vaccination": return <NurseVaccinations />;
      case "appointments": return <NurseAppointments />;
      case "medicalcondition": return <NurseMedicalCondition />;
      default: return <div className="text-gray-600">Chọn một mục để hiển thị</div>;
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
              Bảng điều khiển y tá
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Quản lý sức khỏe học sinh và các hoạt động y tế một cách hiệu quả
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
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

export default NurseDashboard;