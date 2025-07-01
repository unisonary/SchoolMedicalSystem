import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import Tabs from "@/components/ui/Tabs";
import MedicationForm from "./MedicationForm";

interface Medication {
  medicationId: number;
  studentId: number;
  studentName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Student {
  studentId: number;
  name: string;
  class: string;
  dateOfBirth: string;
}

const statusLabelMap: Record<string, string> = {
  Active: "Đang chờ xử lý",
  Completed: "Đã xử lý"
};

const Medications = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [editing, setEditing] = useState<Medication | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/parent/health/students");
      setStudents(res.data);
    } catch {
      toast.error("Không thể tải danh sách học sinh.");
    }
  };

  const fetchMedications = async () => {
    try {
      const res = await axios.get("/parent/health/medications");
      setMedications(res.data);
    } catch {
      toast.error("Không thể tải danh sách thuốc.");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchMedications();
  }, []);

  const tabs = students.map((student) => {
    const studentMeds = medications.filter(m => m.studentId === student.studentId);
    return {
      key: student.studentId.toString(),
      label: `${student.name} (${student.class})`,
      content: (
        <div className="space-y-6">
          <MedicationForm
            studentId={student.studentId}
            editingData={editing?.studentId === student.studentId ? editing : null}
            onSaved={() => {
              fetchMedications();
              setEditing(null);
            }}
            clearEditing={() => setEditing(null)}
          />
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">Danh sách thuốc đã gửi</h3>
            {studentMeds.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có dữ liệu thuốc.</p>
            ) : (
              <table className="w-full table-auto border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Tên thuốc</th>
                    <th className="p-2 border">Liều dùng</th>
                    <th className="p-2 border">Tần suất</th>
                    <th className="p-2 border">Hướng dẫn</th>
                    <th className="p-2 border">Thời gian</th>
                    <th className="p-2 border">Trạng thái</th>
                    <th className="p-2 border">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMeds.map((m) => (
                    <tr key={m.medicationId} className="text-center">
                      <td className="border p-2">{m.medicationName}</td>
                      <td className="border p-2">{m.dosage}</td>
                      <td className="border p-2">{m.frequency}</td>
                      <td className="border p-2">{m.instructions}</td>
                      <td className="border p-2">
                        {new Date(m.startDate).toLocaleDateString()} → {new Date(m.endDate).toLocaleDateString()}
                      </td>
                      <td className="border p-2">{statusLabelMap[m.status] || m.status}</td>
                      <td className="border p-2">
                      <button
                        onClick={() => {
                            if (m.status === "Completed") {
                            toast.info("Thuốc đã cho uống xong, không thể chỉnh sửa.");
                            return;
                            }
                            setEditing(m);
                        }}
                        className="text-blue-600 hover:underline"
                        >
                        <Pencil size={18} />
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )
    };
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">💊 Gửi thuốc cho học sinh</h2>
      <Tabs tabs={tabs} />
    </div>
  );
};

export default Medications;