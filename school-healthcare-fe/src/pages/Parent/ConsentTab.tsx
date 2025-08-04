import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";

interface Consent {
  consentId: number;
  consentType: string;
  referenceId: number;
  consentStatus: "Pending" | "Approved" | "Denied" | "Email_Denied";
  consentDate: string | null;
  notes: string | null;
  studentName: string;
}

const ConsentTab = () => {
  const location = useLocation();
  const [pending, setPending] = useState<Consent[]>([]);
  const [history, setHistory] = useState<Consent[]>([]);
  const [noteModal, setNoteModal] = useState<{ id: number | null; visible: boolean; isEmailDenied?: boolean }>({
    id: null,
    visible: false,
    isEmailDenied: false,
  });
  const [note, setNote] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Kiểm tra nguồn truy cập từ URL parameters
  const searchParams = new URLSearchParams(location.search);
  const isFromGmail = searchParams.get('source') === 'gmail';

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
        notes: `Tôi đồng ý cho con tham gia vào ${
          type === "Vaccination" ? "chương trình tiêm chủng" : "khám sức khỏe định kỳ"
        }.`,
      });
      toast.success("Đã đồng ý xác nhận.");
      fetchData();
    } catch {
      toast.error("Không thể xác nhận.");
    }
  };

  const handleDeny = async (consentId: number, consentType?: string) => {
    if (isFromGmail) {
      // Từ Gmail: Hard code lý do và từ chối trực tiếp
      const hardCodedReason = `Tôi không đồng ý cho con tham gia vào ${
        consentType === "Vaccination" ? "chương trình tiêm chủng" : "kế hoạch khám sức khỏe định kỳ"
      }. (Phản hồi qua email - không có lý do chi tiết)`;
      
      try {
        await axios.post(`/parent/consents/${consentId}`, {
          consentStatus: "Denied",
          notes: hardCodedReason,
        });
        toast.success("Đã từ chối xác nhận.");
        fetchData();
      } catch {
        toast.error("Không thể gửi từ chối.");
      }
    } else {
      // Từ app: Hiện modal nhập lý do (cho cả Pending và Email_Denied)
      setNoteModal({ id: consentId, visible: true, isEmailDenied: false });
    }
  };

  const handleDenyWithNote = () => {
    if (!note.trim()) {
      toast.warn("Vui lòng nhập lý do từ chối.");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDeny = async () => {
    try {
      await axios.post(`/parent/consents/${noteModal.id}`, {
        consentStatus: "Denied",
        notes: note,
      });
      toast.success("Đã từ chối xác nhận.");
      setNoteModal({ id: null, visible: false, isEmailDenied: false });
      setShowConfirmModal(false);
      setNote("");
      fetchData();
    } catch {
      toast.error("Không thể gửi từ chối.");
    }
  };

  return (
    <div className="p-6 space-y-10">
      {/* Banner thông báo khi truy cập từ Gmail */}
      {isFromGmail && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-lg">📧</span>
            <div>
              <p className="font-semibold">Truy cập từ Gmail</p>
              <p className="text-sm text-blue-600">Bạn đang truy cập từ email. Việc từ chối sẽ được thực hiện trực tiếp với lý do mặc định.</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📝 Xác nhận kế hoạch y tế</h2>
        <p className="text-gray-600">Phê duyệt hoặc từ chối các chương trình tiêm chủng và khám sức khỏe</p>
      </div>

      {/* Pending */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-600">Yêu cầu chờ xác nhận</h3>
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm space-y-4">
          {pending.length === 0 ? (
            <p className="italic text-gray-500">Không có yêu cầu chờ xử lý.</p>
          ) : (
            pending.map((c) => (
              <div
                key={c.consentId}
                className={`border rounded-xl p-4 flex justify-between items-start hover:bg-gray-50 transition ${
                  c.consentStatus === "Email_Denied" 
                    ? "border-orange-200 bg-orange-50" 
                    : "border-gray-200"
                }`}
              >
                <div className="text-gray-700 space-y-1">
                  <p><strong>👦 Học sinh:</strong> {c.studentName}</p>
                  <p><strong>📋 Loại:</strong> {c.consentType === "Vaccination" ? "Tiêm chủng" : "Khám sức khỏe"}</p>
                  <p><strong>📌 Mã kế hoạch:</strong> #{c.referenceId}</p>
                  {c.consentStatus === "Email_Denied" && (
                    <p className="text-orange-800 text-sm font-medium">
                      ⚠️ Đã từ chối qua email - Cần nhập lý do chi tiết
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 mt-1">
                  {c.consentStatus === "Email_Denied" ? (
                    // Chỉ hiện nút nhập lý do từ chối
                    <button
                      onClick={() => setNoteModal({ id: c.consentId, visible: true, isEmailDenied: true })}
                      className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition"
                    >
                      <XCircle size={16} className="mr-1" /> Nhập lý do từ chối
                    </button>
                  ) : (
                    // UI bình thường cho Pending
                    <>
                      <button
                        onClick={() => handleApprove(c.consentId, c.consentType)}
                        className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm transition"
                      >
                        <CheckCircle size={16} className="mr-1" /> Đồng ý
                      </button>
                      <button
                        onClick={() => handleDeny(c.consentId, c.consentType)}
                        className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm transition"
                      >
                        <XCircle size={16} className="mr-1" /> Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-600">📜 Lịch sử phản hồi</h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {history.length === 0 ? (
            <div className="p-6 text-center text-gray-500 italic">Chưa có lịch sử phản hồi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Học sinh</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Loại</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Kế hoạch</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Trạng thái</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Ngày phản hồi</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((c) => (
                    <tr key={c.consentId} className="text-gray-800">
                      <td className="border px-4 py-3">{c.studentName}</td>
                      <td className="border px-4 py-3">
                        {c.consentType === "Vaccination" ? "Tiêm chủng" : "Khám sức khỏe"}
                      </td>
                      <td className="border px-4 py-3">#{c.referenceId}</td>
                      <td className="border px-4 py-3 font-semibold">
                        {c.consentStatus === "Approved" ? (
                          <span className="text-green-600">Đã đồng ý</span>
                        ) : (
                          <span className="text-red-600">Đã từ chối</span>
                        )}
                      </td>
                      <td className="border px-4 py-3">
                        {c.consentDate ? new Date(c.consentDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="border px-4 py-3">{c.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal nhập ghi chú */}
      {noteModal.visible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📌 {noteModal.isEmailDenied ? "Nhập lý do từ chối chi tiết" : "Nhập lý do từ chối"}
            </h3>
            {noteModal.isEmailDenied && (
              <p className="text-sm text-gray-600">
                Bạn đã từ chối qua email. Vui lòng nhập lý do chi tiết để hoàn tất.
              </p>
            )}
            <textarea
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 placeholder-gray-400"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do từ chối..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setNoteModal({ id: null, visible: false, isEmailDenied: false })}
                className="px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 rounded-lg transition font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDenyWithNote}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
              >
                Tiếp tục từ chối
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal xác nhận từ chối */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">❗ Xác nhận từ chối</h3>
            <p className="text-gray-600">Bạn có chắc chắn muốn từ chối yêu cầu này?</p>
            <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition font-medium shadow-sm"
            >
              Hủy
            </button>
              <button
                onClick={confirmDeny}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
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
