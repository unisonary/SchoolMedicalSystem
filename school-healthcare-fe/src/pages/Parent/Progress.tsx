import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";

interface MedicalEvent {
  eventId: number;
  studentId: number;
  studentName: string;
  eventType: string;
  description: string;
  date: string;
  nurseName: string;
}

interface HealthCheckup {
  checkupId: number;
  studentId: number;
  studentName: string;
  result: string;
  date: string;
  recommendations: string;
}

const Progress = () => {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);

  useEffect(() => {
    axios.get("/parent/student/events").then((res) => setEvents(res.data));
    axios.get("/parent/student/checkups").then((res) => setCheckups(res.data));
  }, []);

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📈 Theo dõi sức khỏe</h2>
        <p className="text-gray-600">Tổng hợp sự kiện y tế và kết quả khám sức khỏe của học sinh</p>
      </div>

      {/* Medical Events */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-600">📌 Sự kiện y tế</h3>
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm space-y-4">
          {events.length === 0 ? (
            <p className="italic text-gray-500">Không có sự kiện y tế nào.</p>
          ) : (
            events.map((e) => (
              <div
                key={e.eventId}
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition space-y-1"
              >
                <p className="text-gray-800">
                  <strong>{e.studentName}</strong> - {e.eventType}
                </p>
                <p className="text-sm text-gray-600">{e.description}</p>
                <div className="text-sm text-gray-500 flex justify-between mt-1">
                  <span>👩‍⚕️ Y tá: {e.nurseName}</span>
                  <span>🕒 {new Date(e.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Health Checkups */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-600">📋 Kết quả khám sức khỏe</h3>
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm space-y-4">
          {checkups.length === 0 ? (
            <p className="italic text-gray-500">Chưa có dữ liệu khám sức khỏe.</p>
          ) : (
            checkups.map((c) => (
              <div
                key={c.checkupId}
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition space-y-1"
              >
                <p className="text-gray-800">
                  <strong>{c.studentName}</strong> - {c.result}
                </p>
                <p className="text-sm text-gray-600">Ghi chú: {c.recommendations}</p>
                <div className="text-sm text-gray-500 flex justify-between mt-1">
                  <span>📅 {new Date(c.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
