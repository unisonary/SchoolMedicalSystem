import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";

interface Consent {
  consentId: number;
  consentType: string;
  referenceId: number;
  consentStatus: string;
  consentDate: string | null;
  notes: string | null;
  studentName: string;
}


const ConsentTab = () => {
  const [pending, setPending] = useState<Consent[]>([]);
  const [history, setHistory] = useState<Consent[]>([]);
  const [noteModal, setNoteModal] = useState<{ id: number | null; visible: boolean }>({
    id: null,
    visible: false,
  });
  const [note, setNote] = useState("");

  const fetchData = async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        axios.get("/parent/consents/pending"),
        axios.get("/parent/consents/history"),
      ]);
      setPending(pendingRes.data);
      setHistory(historyRes.data);
    } catch {
      toast.error("Không thể tải dữ liệu xác nhận.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number, type: string) => {
    try {
      await axios.post(`/parent/consents/${id}`, {
        consentStatus: "Approved",
        notes: `Tôi đồng ý cho con tham gia vào ${type === "Vaccination" ? "chương trình tiêm chủng" : "khám sức khỏe định kỳ"}.`,
      });
      toast.success("Đã đồng ý xác nhận.");
      fetchData();
    } catch {
      toast.error("Không thể xác nhận.");
    }
  };

  const handleDeny = async () => {
    if (!note.trim()) {
      toast.warn("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      await axios.post(`/parent/consents/${noteModal.id}`, {
        consentStatus: "Denied",
        notes: note,
      });
      toast.success("Đã từ chối xác nhận.");
      setNoteModal({ id: null, visible: false });
      setNote("");
      fetchData();
    } catch {
      toast.error("Không thể gửi từ chối.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-blue-700">📝 Yêu cầu chờ xác nhận</h2>
      <div className="bg-white shadow rounded p-4 space-y-4">
        {pending.length === 0 ? (
          <p className="italic text-gray-500">Không có yêu cầu chờ xử lý.</p>
        ) : (
          pending.map((c) => (
            <div key={c.consentId} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p><strong>Học sinh:</strong> {c.studentName}</p>
                <p><strong>Loại:</strong> {c.consentType === "Vaccination" ? "Tiêm chủng" : "Khám sức khỏe"}</p>
                <p><strong>Mã kế hoạch:</strong> #{c.referenceId}</p>
              </div>

              <div className="space-x-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => handleApprove(c.consentId, c.consentType)}
                >
                  Đồng ý
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => setNoteModal({ id: c.consentId, visible: true })}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="text-xl font-semibold text-blue-700">📜 Lịch sử phản hồi</h2>
      <div className="bg-white shadow rounded p-4 space-y-4">
        {history.length === 0 ? (
          <p className="italic text-gray-500">Chưa có lịch sử phản hồi.</p>
        ) : (
          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Học sinh</th>
                <th className="p-2 border">Loại</th>
                <th className="p-2 border">Kế hoạch</th>
                <th className="p-2 border">Trạng thái</th>
                <th className="p-2 border">Ngày phản hồi</th>
                <th className="p-2 border">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {history.map((c) => (
                <tr key={c.consentId}>
                  <td className="border p-2">{c.studentName}</td>
                  <td className="border p-2">{c.consentType === "Vaccination" ? "Tiêm chủng" : "Khám sức khỏe"}</td>
                  <td className="border p-2">#{c.referenceId}</td>
                  <td className="border p-2">{c.consentStatus === "Approved" ? "Đã đồng ý" : "Đã từ chối"}</td>
                  <td className="border p-2">
                    {c.consentDate ? new Date(c.consentDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="border p-2">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {noteModal.visible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nhập lý do từ chối</h3>
            <textarea
              className="w-full border p-2 rounded mb-4"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do từ chối..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setNoteModal({ id: null, visible: false })}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeny}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentTab;