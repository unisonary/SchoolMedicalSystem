
import { useState } from "react";
import { Activity, Pill, FileCheck, TrendingUp, Bell } from "lucide-react";
import MedicalConditions from "./MedicalConditions";
import Medications from "./Medications";
import ConsentTab from "./ConsentTab"; 
import Progress from "./Progress";
import Notifications from "./Notifications";

const tabs = [
  { 
    key: "conditions", 
    label: "Hồ sơ sức khỏe", 
    icon: Activity,
    color: "from-blue-500 to-cyan-500",
    description: "Quản lý tình trạng y tế của con"
  },
  { 
    key: "medications", 
    label: "Gửi thuốc", 
    icon: Pill,
    color: "from-green-500 to-emerald-500",
    description: "Gửi yêu cầu cho con uống thuốc"
  },
  { 
    key: "consent", 
    label: "Xác nhận kế hoạch", 
    icon: FileCheck,
    color: "from-purple-500 to-violet-500",
    description: "Phê duyệt các kế hoạch y tế"
  },
  { 
    key: "progress", 
    label: "Theo dõi sức khỏe", 
    icon: TrendingUp,
    color: "from-orange-500 to-red-500",
    description: "Xem báo cáo sức khỏe con"
  },
  { 
    key: "notifications", 
    label: "Thông báo y tế", 
    icon: Bell,
    color: "from-pink-500 to-rose-500",
    description: "Các thông báo quan trọng"
  },
];

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("parent-tab") || "conditions");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem("parent-tab", key);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "conditions":
        return <MedicalConditions />;
      case "medications":
        return <Medications />;
      case "consent":
        return <ConsentTab />;
      case "progress":
        return <Progress />;
      case "notifications":
        return <Notifications />;
      default:
        return <div>Chọn một mục để hiển thị</div>;
    }
  };

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Trang Phụ Huynh
              </h1>
              <p className="text-gray-600 mt-1">Quản lý sức khỏe con em một cách dễ dàng</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`group relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? "bg-white shadow-xl ring-2 ring-blue-500/20"
                    : "bg-white/70 shadow-md hover:shadow-lg hover:bg-white"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-all ${
                    isActive 
                      ? `bg-gradient-to-r ${tab.color}` 
                      : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:" + tab.color
                  }`}>
                    <Icon className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-white"}`} size={24} />
                  </div>
                  <h3 className={`font-semibold text-sm mb-2 ${isActive ? "text-blue-600" : "text-gray-800"}`}>
                    {tab.label}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tab Header */}
        {activeTabData && (
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${activeTabData.color} flex items-center justify-center`}>
                <activeTabData.icon className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{activeTabData.label}</h2>
                <p className="text-sm text-gray-600">{activeTabData.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
