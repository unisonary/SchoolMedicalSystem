import { useState, useRef, useEffect } from "react";
import { Activity, Heart, Syringe  } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import StudentMedicalEvents from "./StudentMedicalEvents";
import StudentVaccinations from "./StudentVaccinations";
import StudentCheckups from "./StudentCheckups";

const tabs = [
  {
    key: "events",
    label: "Sự kiện y tế",
    icon: Activity,
    color: "from-red-400 to-pink-500",
    description: "Sự kiện y tế xảy ra trong trường",
  },
  {
    key: "vaccinations",
    label: "Tiêm chủng",
    icon: Syringe,
    color: "from-sky-400 to-indigo-500",
    description: "Lịch sử tiêm và phản ứng sau tiêm",
  },
  {
    key: "checkups",
    label: "Khám sức khỏe",
    icon: Heart,
    color: "from-orange-400 to-yellow-500",
    description: "Kết quả khám sức khỏe định kỳ",
  },
];

const StudentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("student-tab") || "records");
  const [key, setKey] = useState(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    localStorage.setItem("student-tab", tabKey);

    setTimeout(() => {
      if (contentRef.current && headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const target = headerRef.current.offsetTop + headerHeight - 20;
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    const stored = localStorage.getItem("student-tab") || "records";
    setActiveTab(stored);
  }, [key]);

  useEffect(() => {
    const sync = () => setKey(Date.now());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "events":
        return <StudentMedicalEvents />;
      case "vaccinations":
        return <StudentVaccinations />;
      case "checkups":
        return <StudentCheckups />;
      default:
        return <div>Chọn một mục để xem thông tin.</div>;
    }
  };

  const activeTabData = tabs.find((t) => t.key === activeTab);

  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-lime-50 min-h-screen">
      <MainLayout key={key}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Bảng điều khiển học sinh
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Xem lại thông tin sức khỏe và lịch sử điều trị của bạn tại trường
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`group relative p-4 sm:p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? "bg-white shadow-xl ring-2 ring-green-500/20 scale-105"
                      : "bg-white/70 shadow-md hover:shadow-lg hover:bg-white"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4 flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} shadow-lg`
                          : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:" + tab.color
                      }`}
                    >
                      <Icon className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-white"}`} size={20} />
                    </div>
                    <h3 className={`font-semibold text-xs sm:text-sm mb-1 sm:mb-2 ${isActive ? "text-green-600" : "text-gray-800"}`}>
                      {tab.label}
                    </h3>
                    <p className="text-xs text-gray-500 hidden sm:block">{tab.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tab Header */}
          {activeTabData && (
            <div ref={headerRef} className="mb-6 bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${activeTabData.color} flex items-center justify-center shadow-lg`}>
                  <activeTabData.icon className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">{activeTabData.label}</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{activeTabData.description}</p>
                </div>
                <div className={`hidden sm:block w-1 h-12 bg-gradient-to-b ${activeTabData.color} rounded-full`} />
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

export default StudentDashboardPage;
