import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";

interface Notification {
  notificationId: number;
  studentId: number;
  studentName: string;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  priority: string;
}

const Notifications = ({ onRead }: { onRead?: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("/parent/student/notifications");
      setNotifications(res.data);
    } catch {
      toast.error("Không thể tải danh sách thông báo.");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(`/parent/student/notifications/${id}/read`);
      fetchData();
      onRead?.();
    } catch {
      toast.error("Không thể cập nhật trạng thái đã đọc.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`/parent/student/notifications/mark-all-read`);
      toast.success("Đã đánh dấu tất cả là đã đọc.");
      fetchData();
      onRead?.();
    } catch {
      toast.error("Không thể đánh dấu tất cả là đã đọc.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="p-6 space-y-10">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📢 Thông báo y tế</h2>
        <p className="text-gray-600">Cập nhật những thông báo quan trọng liên quan đến sức khỏe học sinh</p>
      </div>

      {/* Chưa đọc */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-blue-600">📬 Thông báo chưa đọc</h3>
          {unread.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium shadow transition"
            >
              ✅ Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>

        {unread.length === 0 ? (
          <p className="italic text-gray-500">Không có thông báo mới.</p>
        ) : (
          unread.map((n) => (
            <div
              key={n.notificationId}
              className="border border-blue-200 rounded-xl p-4 bg-white shadow-sm hover:bg-blue-50 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{n.title}</h4>
                  <p className="text-sm text-gray-600">{n.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    👤 {n.studentName} | 📅 {new Date(n.date).toLocaleDateString()} | 🧾 Ưu tiên: {n.priority}
                  </p>
                </div>
                <button
                  onClick={() => markAsRead(n.notificationId)}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                >
                  Đánh dấu đã đọc
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Đã đọc */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-600">📖 Thông báo đã đọc</h3>
        {read.length === 0 ? (
          <p className="italic text-gray-500">Chưa có thông báo nào đã đọc.</p>
        ) : (
          read.map((n) => (
            <div
              key={n.notificationId}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm"
            >
              <h4 className="text-lg font-semibold text-gray-700">{n.title}</h4>
              <p className="text-sm text-gray-600">{n.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                👤 {n.studentName} | 📅 {new Date(n.date).toLocaleDateString()} | 🧾 Ưu tiên: {n.priority}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;