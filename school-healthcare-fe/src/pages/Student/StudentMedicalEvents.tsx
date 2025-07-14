import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { format } from "date-fns";
import { Activity } from "lucide-react";

interface MedicalEvent {
  eventId: number;
  date: string;
  description: string;
  severity: string;
  eventType: string;
  nurseName: string;
}

const severityColor = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-700",
};

const StudentMedicalEvents = () => {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/student/health/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy sự kiện y tế:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">Không có sự kiện y tế nào được ghi nhận.</p>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.eventId}
              className="p-4 border rounded-xl shadow-sm hover:shadow-md transition bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-800">{ev.eventType}</h3>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    severityColor[ev.severity as keyof typeof severityColor] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  Mức độ: {ev.severity}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2">{ev.description}</p>

              <div className="text-xs text-gray-500 flex justify-between">
                <span>Ngày: {format(new Date(ev.date), "dd/MM/yyyy")}</span>
                <span>Ghi nhận bởi: {ev.nurseName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMedicalEvents;
