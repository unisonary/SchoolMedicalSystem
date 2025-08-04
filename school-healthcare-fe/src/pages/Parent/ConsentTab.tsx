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

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full mb-6 shadow-lg">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Xác nhận kế hoạch y tế
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Phê duyệt hoặc từ chối các chương trình tiêm chủng và khám sức khỏe cho con em của bạn
        </p>
      </div>

      {/* Enhanced Pending Section */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
          <h3 className="text-2xl font-bold text-gray-800">Yêu cầu chờ xác nhận</h3>
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {pending.length}
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 rounded-full transform translate-x-16 -translate-y-16"></div>
          
          {pending.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Tất cả đã xử lý!</h4>
              <p className="text-gray-600">Không có yêu cầu nào cần xác nhận lúc này</p>
            </div>
          ) : (
            pending.map((c, index) => (
              <div
                key={c.consentId}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`border-2 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl animate-fade-in relative overflow-hidden ${
                  c.consentStatus === "Email_Denied" 
                    ? "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg" 
                    : "border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 hover:bg-blue-50 shadow-md"
                }`}
              >
                {/* Status indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  c.consentStatus === "Email_Denied" ? "bg-gradient-to-b from-orange-500 to-amber-500" : "bg-gradient-to-b from-blue-500 to-cyan-500"
                }`}></div>
                
                <div className="flex-1 space-y-3 ml-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      c.consentType === "Vaccination" 
                        ? "bg-gradient-to-br from-green-500 to-emerald-500" 
                        : "bg-gradient-to-br from-purple-500 to-violet-500"
                    } shadow-lg`}>
                      <span className="text-white font-bold text-lg">
                        {c.consentType === "Vaccination" ? "💉" : "🏥"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{c.studentName}</h4>
                      <p className="text-sm text-gray-600">
                        {c.consentType === "Vaccination" ? "Chương trình tiêm chủng" : "Khám sức khỏe định kỳ"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Mã kế hoạch:</span> #{c.referenceId}
                    </p>
                  </div>
                  
                  {c.consentStatus === "Email_Denied" && (
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300 rounded-lg p-3">
                      <p className="text-orange-800 text-sm font-semibold flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>Đã từ chối qua email - Cần nhập lý do chi tiết</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0 sm:ml-4">
                  {c.consentStatus === "Email_Denied" ? (
                    <button
                      onClick={() => setNoteModal({ id: c.consentId, visible: true, isEmailDenied: true })}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      <XCircle size={18} className="mr-2" />
                      Nhập lý do từ chối
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(c.consentId, c.consentType)}
                        className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        Đồng ý
                      </button>
                      <button
                        onClick={() => handleDeny(c.consentId, c.consentType)}
                        className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
                      >
                        <XCircle size={18} className="mr-2" />
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enhanced History Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
          <h3 className="text-2xl font-bold text-gray-800">Lịch sử phản hồi</h3>
          <span className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {history.length}
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-2xl overflow-hidden shadow-xl relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-violet-500 opacity-5 rounded-full transform translate-x-16 -translate-y-16"></div>
          
          {history.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">📜</span>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Chưa có lịch sử</h4>
              <p className="text-gray-600">Lịch sử phản hồi sẽ xuất hiện tại đây</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-violet-100 border-b-2 border-purple-200">
                    <th className="text-left px-6 py-4 text-purple-800 font-bold text-sm">Học sinh</th>
                    <th className="text-left px-6 py-4 text-purple-800 font-bold text-sm">Loại</th>
                    <th className="text-left px-6 py-4 text-purple-800 font-bold text-sm">Kế hoạch</th>
                    <th className="text-left px-6 py-4 text-purple-800 font-bold text-sm">Trạng thái</th>
                    <th className="text-left px-6 py-4 text-purple-800 font-bold text-sm">Ngày phản hồi</th>
                    <th className="text-left px-6 py-4 text-purple-800 font-bold text-sm">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((c, index) => (
                    <tr 
                      key={c.consentId} 
                      className={`text-gray-800 transition-colors duration-200 hover:bg-purple-50 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-purple-50/30'
                      }`}
                    >
                      <td className="px-6 py-4 border-b border-purple-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {c.studentName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-semibold">{c.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-purple-100">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          c.consentType === "Vaccination" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-purple-100 text-purple-800"
                        }`}>
                          {c.consentType === "Vaccination" ? "💉 Tiêm chủng" : "🏥 Khám sức khỏe"}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-purple-100">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono text-xs">
                          #{c.referenceId}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-purple-100">
                        {c.consentStatus === "Approved" ? (
                          <span className="flex items-center space-x-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle size={14} />
                            <span>Đã đồng ý</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold">
                            <XCircle size={14} />
                            <span>Đã từ chối</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-b border-purple-100 text-sm">
                        {c.consentDate ? new Date(c.consentDate).toLocaleDateString('vi-VN') : "-"}
                      </td>
                      <td className="px-6 py-4 border-b border-purple-100">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-700 truncate" title={c.notes || ''}>
                            {c.notes || "-"}
                          </p>
                        </div>
                      </td>
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
