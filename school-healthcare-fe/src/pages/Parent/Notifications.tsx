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

const Notifications = () => {
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
    } catch {
      toast.error("Không thể cập nhật trạng thái đã đọc.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-blue-700">📢 Thông báo y tế</h2>
      {notifications.length === 0 ? (
        <p className="italic text-gray-500">Không có thông báo nào.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.notificationId} className="border rounded p-3 shadow-sm bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.content}</p>
                  <p className="text-xs text-gray-500">
                    {n.studentName} - {new Date(n.date).toLocaleDateString()} -{" "}
                    {n.isRead ? "✅ Đã đọc" : "❗ Chưa đọc"}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n.notificationId)}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;