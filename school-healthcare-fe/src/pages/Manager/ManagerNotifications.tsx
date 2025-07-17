import { useEffect, useState } from "react";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  Calendar, 
  AlertCircle, 
  Clock,
  CheckCheck,
  Mail,
  MailOpen,
  Zap,
  Shield,
  Info
} from "lucide-react";
import axios from "@/api/axiosInstance";



const toast = {
  error: (msg: string) => console.error(msg),
  success: (msg: string) => console.log(msg)
};

interface Notification {
  notificationId: number;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  priority: string;
}


const ManagerNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("/manager/notifications");
      setNotifications(res.data);
    } catch {
      toast.error("Không thể tải danh sách thông báo.");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`/manager/notifications/${id}/read`);
      fetchData();
    } catch {
      toast.error("Không thể cập nhật trạng thái đã đọc.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`/manager/notifications/mark-all-read`);
      toast.success("Đã đánh dấu tất cả là đã đọc.");
      fetchData();
    } catch {
      toast.error("Không thể đánh dấu tất cả là đã đọc.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "MEDIUM":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "LOW":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          📢 Thông báo hệ thống
        </h2>
        <p className="text-gray-600">Cập nhật những cảnh báo hoặc thông tin y tế dành cho quản lý</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Tổng thông báo</p>
              <p className="text-3xl font-bold text-blue-800">{notifications.length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Chưa đọc</p>
              <p className="text-3xl font-bold text-orange-800">{unread.length}</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-full">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Đã đọc</p>
              <p className="text-3xl font-bold text-green-800">{read.length}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <MailOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Unread Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-blue-800 flex items-center space-x-2">
              <BellRing className="w-5 h-5 text-blue-600" />
              <span>📬 Thông báo chưa đọc</span>
              <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm">
                {unread.length}
              </span>
            </h3>
            {unread.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 text-sm px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Đánh dấu tất cả là đã đọc</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {unread.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-500 text-lg">Không có thông báo mới</p>
              <p className="text-gray-400 text-sm mt-2">Tất cả thông báo đã được đọc</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unread.map((n) => (
                <div
                  key={n.notificationId}
                  className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">{n.title}</h4>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(n.priority)}`}>
                          {getPriorityIcon(n.priority)}
                          <span>{n.priority}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3 leading-relaxed">{n.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(n.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4" />
                          <span>Ưu tiên: {n.priority}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(n.notificationId)}
                      className="flex items-center space-x-2 px-4 py-2 ml-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105 text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Đánh dấu đã đọc</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Read Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <MailOpen className="w-5 h-5 text-gray-600" />
            <span>📖 Thông báo đã đọc</span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {read.length}
            </span>
          </h3>
        </div>

        <div className="p-6">
          {read.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có thông báo nào đã đọc</p>
              <p className="text-gray-400 text-sm mt-2">Các thông báo đã đọc sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            <div className="space-y-4">
              {read.map((n) => (
                <div
                  key={n.notificationId}
                  className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-700">{n.title}</h4>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(n.priority)}`}>
                      {getPriorityIcon(n.priority)}
                      <span>{n.priority}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Đã đọc</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 leading-relaxed">{n.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(n.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Ưu tiên: {n.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerNotifications;