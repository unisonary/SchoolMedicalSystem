import { useEffect, useState, useRef } from "react";
import {
  UserCog,
  KeyRound,
  FileText,
  Newspaper,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

// 👉 Bạn cần tạo các component tương ứng
import AdminAccounts from "./AdminAccounts";
import AdminPassword  from "./AdminPassword";
import AdminImportExcel from "./AdminImportExcel"; // THÊM DÒNG NÀY
// import AdminDocuments from "./AdminDocuments";
// import AdminBlogs from "./AdminBlogs";

const tabs = [
  {
    key: "accounts",
    label: "Tài khoản",
    icon: UserCog,
    color: "from-blue-500 to-cyan-500",
    description: "Tạo, cập nhật và quản lý tài khoản người dùng",
  },
  {
    key: "reset",
    label: "Mật khẩu",
    icon: KeyRound,
    color: "from-pink-500 to-red-400",
    description: "Đặt lại mật khẩu hoặc nhập người dùng từ Excel",
  },
  {
    key: "import",
    label: "Import Users",
    icon: FileText, // Có thể thay icon khác nếu bạn muốn
    color: "from-yellow-400 to-orange-400",
    description: "Nhập người dùng từ file Excel",
  },  
  {
    key: "documents",
    label: "Tài liệu",
    icon: FileText,
    color: "from-teal-500 to-emerald-500",
    description: "Thêm, sửa và xoá tài liệu sức khoẻ",
  },
  {
    key: "blogs",
    label: "Blog",
    icon: Newspaper,
    color: "from-purple-500 to-violet-500",
    description: "Quản lý các bài viết blog hữu ích",
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("admin-tab") || "accounts");
  const [key, setKey] = useState(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    localStorage.setItem("admin-tab", key);

    setTimeout(() => {
      if (contentRef.current && headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const targetPosition = headerRef.current.offsetTop + headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  useEffect(() => {
    const tab = localStorage.getItem("admin-tab") || "accounts";
    setActiveTab(tab);
  }, [key]);

  useEffect(() => {
    const syncTab = () => setKey(Date.now());
    window.addEventListener("storage", syncTab);
    return () => window.removeEventListener("storage", syncTab);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "accounts": return <AdminAccounts />;
      case "reset": return <AdminPassword  />;
      case "import": return <AdminImportExcel />;
    //   case "documents": return <AdminDocuments />;
    //   case "blogs": return <AdminBlogs />;
      default: return <div className="text-gray-600">Chọn một mục để hiển thị</div>;
    }
  };

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      <MainLayout key={key}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Bảng điều khiển quản trị viên
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Quản lý người dùng và nội dung hệ thống
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? "bg-white shadow-xl ring-2 ring-blue-500/20 scale-105" 
                      : "bg-white/70 shadow-md hover:shadow-lg hover:bg-white"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} shadow-lg` 
                        : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:" + tab.color
                    }`}>
                      <Icon className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-white"} transition-colors duration-300`} size={20} />
                    </div>
                    <h3 className={`font-semibold text-xs sm:text-sm mb-1 ${
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
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${activeTabData.color} flex items-center justify-center shadow-lg`}>
                  <activeTabData.icon className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                    {activeTabData.label}
                  </h2>
                  <p className="text-sm text-gray-600">
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

export default AdminDashboard;
