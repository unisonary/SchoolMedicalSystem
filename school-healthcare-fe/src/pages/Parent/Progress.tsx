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
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-blue-700 mb-2">📌 Sự kiện y tế</h2>
        {events.length === 0 ? (
          <p className="italic text-gray-500">Không có sự kiện y tế nào.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {events.map((e) => (
              <li key={e.eventId}>
                <strong>{e.studentName}</strong> - {e.eventType}: {e.description} ({new Date(e.date).toLocaleDateString()})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-blue-700 mb-2">📋 Kết quả khám sức khỏe</h2>
        {checkups.length === 0 ? (
          <p className="italic text-gray-500">Chưa có dữ liệu khám sức khỏe.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {checkups.map((c) => (
              <li key={c.checkupId}>
                <strong>{c.studentName}</strong> - {c.result} ({new Date(c.date).toLocaleDateString()})<br />
                <span className="text-sm text-gray-600">Ghi chú: {c.recommendations}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Progress;