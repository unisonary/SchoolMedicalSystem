import { useState } from "react";
import MedicalConditions from "./MedicalConditions";
import Medications from "./Medications";
import ConsentTab from "./ConsentTab"; 
import Progress from "./Progress";
import Notifications from "./Notifications";
  // import Progress from "./Progress";
  // import Notifications from "./Notifications";

const tabs = [
  { key: "conditions", label: "Hồ sơ sức khỏe" },
  { key: "medications", label: "Gửi thuốc" },
  { key: "consent", label: "Xác nhận kế hoạch" },
  { key: "progress", label: "Theo dõi sức khỏe" },
  { key: "notifications", label: "Thông báo y tế" },
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
        return <ConsentTab />; // ✅ Thêm dòng này
      case "progress":
        return <Progress />;
      case "notifications":
        return <Notifications />;
      default:
        return <div>Chọn một mục để hiển thị</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Trang Phụ Huynh</h1>

      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">{renderTabContent()}</div>
    </div>
  );
};

export default ParentDashboard;