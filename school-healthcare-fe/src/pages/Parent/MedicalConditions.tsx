import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Pencil, Trash } from "lucide-react";
import MedicalConditionForm from "./MedicalConditionForm";
import Tabs from "@/components/ui/Tabs";

interface MedicalCondition {
  conditionId: number;
  conditionType: string;
  conditionName: string;
  severity: string;
  description: string;
  studentId: number;
  studentName: string;
}

interface Student {
  studentId: number;
  name: string;
  class: string;
  dateOfBirth: string;
}

const MedicalConditions = () => {
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [, setSelectedStudentId] = useState<number | null>(null);
  const [editing, setEditing] = useState<MedicalCondition | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá?")) return;
    try {
      await axios.delete(`/parent/health/medical-condition/${id}`);
      toast.success("Đã xoá thành công.");
      fetchConditions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xoá.");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/parent/health/students");
      setStudents(res.data);
      if (res.data.length > 0) setSelectedStudentId(res.data[0].studentId);
    } catch {
      toast.error("Không thể tải danh sách học sinh.");
    }
  };

  const fetchConditions = async () => {
    try {
      const res = await axios.get("/parent/health/medical-condition");
      setConditions(res.data);
    } catch {
      toast.error("Không thể tải danh sách tình trạng y tế.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStudents(), fetchConditions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">📋 Quản lý tình trạng y tế học sinh</h2>
        <p className="text-gray-500 italic">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">📋 Quản lý tình trạng y tế học sinh</h2>
        <p className="text-gray-500 italic">Chưa có học sinh nào được liên kết với phụ huynh này.</p>
      </div>
    );
  }

  const tabs = students.map((student) => {
    const studentConditions = conditions.filter((c) => c.studentId === student.studentId);
    return {
      key: student.studentId.toString(),
      label: `${student.name} (${student.class})`,
      content: (
        <div className="space-y-6">
          <MedicalConditionForm
            studentId={student.studentId}
            editingData={editing?.studentId === student.studentId ? editing : null}
            onSaved={() => {
              fetchConditions();
              setEditing(null);
            }}
            clearEditing={() => setEditing(null)}
          />
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Danh sách tình trạng y tế</h3>
            {studentConditions.length === 0 ? (
              <p className="text-gray-500">Chưa có dữ liệu.</p>
            ) : (
              <table className="w-full table-auto border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Loại</th>
                    <th className="p-2 border">Tên</th>
                    <th className="p-2 border">Mức độ</th>
                    <th className="p-2 border">Ghi chú</th>
                    <th className="p-2 border">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {studentConditions.map((c) => (
                    <tr key={c.conditionId} className="text-center">
                      <td className="border p-2">{c.conditionType}</td>
                      <td className="border p-2">{c.conditionName}</td>
                      <td className="border p-2">{c.severity}</td>
                      <td className="border p-2">{c.description}</td>
                      <td className="border p-2 flex justify-center space-x-2">
                        <button onClick={() => setEditing(c)} className="text-blue-600 hover:underline">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(c.conditionId)} className="text-red-600 hover:underline">
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">📋 Quản lý tình trạng y tế học sinh</h2>
      <Tabs tabs={tabs} onChange={(key) => {
        setEditing(null);
        setSelectedStudentId(parseInt(key));
      }} />
    </div>
  );
};

export default MedicalConditions;