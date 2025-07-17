// src/pages/parent/Notifications.tsx

import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Bell, Mail, MailOpen } from "lucide-react";

interface Notification {
  notificationId: number;
  studentName: string;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  priority: 'High' | 'Normal' | 'Low';
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

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-l-4 border-red-500';
      case 'Normal': return 'border-l-4 border-blue-500';
      default: return 'border-l-4 border-gray-400';
    }
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Thông báo y tế
        </h2>
        <p className="text-gray-600 mt-2">Cập nhật những thông báo quan trọng liên quan đến sức khỏe học sinh</p>
      </div>

      {/* Unread */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="text-blue-500" /> Thông báo chưa đọc
          </h3>
          {unread.length > 0 && (
            <button onClick={markAllAsRead} className="text-sm px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition">
              Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>
        <div className="space-y-4">
          {unread.length === 0 ? (
            <div className="text-center italic text-gray-500 bg-white border border-dashed rounded-xl p-8">Không có thông báo mới.</div>
          ) : (
            unread.map((n) => (
              <div key={n.notificationId} className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition flex justify-between items-start ${getPriorityClass(n.priority)}`}>
                <div>
                  <h4 className="font-semibold text-gray-800">{n.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{n.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {n.studentName} • {new Date(n.date).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => markAsRead(n.notificationId)} className="ml-4 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm transition whitespace-nowrap">
                  Đã đọc
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Read */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <MailOpen className="text-blue-500" /> Thông báo đã đọc
        </h3>
        <div className="space-y-3">
          {read.length === 0 ? (
            <div className="text-center italic text-gray-500 bg-white border border-dashed rounded-xl p-8">Chưa có thông báo nào đã đọc.</div>
          ) : (
            read.map((n) => (
              <div key={n.notificationId} className={`bg-gray-50 rounded-xl p-4 opacity-80 ${getPriorityClass(n.priority)}`}>
                <h4 className="font-semibold text-gray-600">{n.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{n.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {n.studentName} • {new Date(n.date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;