import { useEffect, useState, useMemo } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Pill, FileImage, ThumbsUp, ThumbsDown, PlusCircle, AlertTriangle, History, Filter } from "lucide-react";
import MedicationFormForNurse from "./MedicationFormForNurse";

// Cập nhật interface để có thêm ClassName
interface Medication {
  medicationId: number;
  studentName: string;
  className: string; // THÊM MỚI
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: string;
  prescriptionImageUrl?: string;
  rejectionReason?: string;
}

const NurseMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<"pending" | "add" | "approved" | "completed">("pending");
  
  // State mới cho bộ lọc
  const [filterToday, setFilterToday] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);

  const statusMap: Record<string, string> = {
    pending: "PendingConfirmation",
    approved: "Approved",
    completed: "Administered"
  };

  const fetchMedications = async () => {
    if (mode === "add") {
      setMedications([]);
      return;
    }
    try {
      setLoading(true);
      const status = statusMap[mode];
      const res = await axios.get(`nurse/medications?status=${status}`);
      setMedications(res.data);
    } catch {
      toast.error(`Không thể tải danh sách thuốc.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [mode]);

  // Tối ưu logic lọc: Chỉ tính toán lại khi medications hoặc filterToday thay đổi
  const filteredMedications = useMemo(() => {
    if (!filterToday || mode !== 'approved') {
      return medications;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay

    return medications.filter(med => {
        const startDate = new Date(med.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(med.endDate);
        endDate.setHours(0, 0, 0, 0);
        return today >= startDate && today <= endDate;
    });
  }, [medications, filterToday, mode]);


  const handleMarkAdministered = async (id: number, endDate: string) => {
    // Tối ưu logic: Chỉ cho phép hoàn thành vào ngày kết thúc
    const today = new Date();
    const end = new Date(endDate);
    if (today.toDateString() !== end.toDateString()) {
        toast.warn("Chỉ có thể đánh dấu hoàn thành vào đúng ngày kết thúc liều dùng.");
        return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      await axios.put(`nurse/medications/${id}/administer`);
      toast.success("Đã đánh dấu cho uống thành công.");
      fetchMedications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái.");
    } finally {
      setProcessingIds(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
    }
  };

  // Các hàm handleAccept, handleOpenRejectModal, handleReject giữ nguyên
  const handleAccept = async (id: number) => { 
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      await axios.put(`nurse/medications/${id}/accept`);
      toast.success("Đã chấp nhận yêu cầu.");
      fetchMedications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi chấp nhận yêu cầu.");
    } finally {
      setProcessingIds(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
    }
   };
  const handleOpenRejectModal = (id: number) => { 
    setSelectedMedId(id);
    setShowRejectModal(true);
   };
  const handleReject = async () => { 
    if (!selectedMedId || !rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      setProcessingIds(prev => new Set(prev).add(selectedMedId));
      await axios.put(`nurse/medications/${selectedMedId}/reject`, { rejectionReason });
      toast.success("Đã từ chối yêu cầu.");
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedMedId(null);
      fetchMedications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi từ chối yêu cầu.");
    } finally {
      if (selectedMedId) {
        setProcessingIds(prev => { const newSet = new Set(prev); newSet.delete(selectedMedId); return newSet; });
      }
    }
  };

  const renderContent = () => {
    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    
    const displayList = filterToday ? filteredMedications : medications;

    if (displayList.length === 0) {
        return <p className="p-8 text-center text-gray-500">Không có dữ liệu trong mục này.</p>;
    }

    // Giao diện cho tab "Chờ xác nhận"
    if (mode === 'pending') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50"><tr className="border-b-2 border-gray-200 text-left text-sm text-gray-600 font-semibold"><th className="p-4">Học sinh</th><th className="p-4">Lớp</th><th className="p-4">Tên thuốc</th><th className="p-4">Toa thuốc</th><th className="p-4 text-center">Hành động</th></tr></thead>
                    <tbody>
                        {displayList.map((med) => (
                            <tr key={med.medicationId} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{med.studentName}</td><td className="p-4 text-sm text-gray-600">{med.className}</td><td className="p-4">{med.medicationName}</td>
                                <td className="p-4">{med.prescriptionImageUrl ? (<a href={med.prescriptionImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-blue-600 hover:underline"><FileImage size={16} /><span>Xem toa</span></a>) : <span className="text-gray-400 italic">Không có</span>}</td>
                                <td className="p-4"><div className="flex justify-center space-x-2"><button onClick={() => handleAccept(med.medicationId)} disabled={processingIds.has(med.medicationId)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors" title="Chấp nhận"><ThumbsUp size={18} /></button><button onClick={() => handleOpenRejectModal(med.medicationId)} disabled={processingIds.has(med.medicationId)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Từ chối"><ThumbsDown size={18} /></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    // Giao diện cho tab "Thuốc đã duyệt" được tối ưu
    if (mode === 'approved') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="border-b-2 border-gray-200 text-left text-sm text-gray-600 font-semibold">
                            <th className="p-4">Học sinh</th>
                            <th className="p-4">Lớp</th>
                            <th className="p-4">Tên thuốc</th>
                            <th className="p-4">Liều dùng</th>
                            <th className="p-4">Tần suất</th>
                            <th className="p-4">Hướng dẫn</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayList.map((med) => (
                            <tr key={med.medicationId} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{med.studentName}</td>
                                <td className="p-4 text-sm text-gray-600">{med.className}</td>
                                <td className="p-4">{med.medicationName}</td>
                                <td className="p-4 text-sm">{med.dosage}</td>
                                <td className="p-4 text-sm">{med.frequency}</td>
                                <td className="p-4 text-sm text-gray-500 italic">{med.instructions || "Không có"}</td>
                                <td className="p-4 text-sm text-gray-600">
                                    {new Date(med.startDate).toLocaleDateString()} → {new Date(med.endDate).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleMarkAdministered(med.medicationId, med.endDate)} disabled={processingIds.has(med.medicationId)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50">
                                        {processingIds.has(med.medicationId) ? "Đang xử lý..." : "Đã cho uống"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    
    // Giao diện cho tab "Lịch sử"
    if (mode === 'completed') {
        return (
             <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="border-b-2 border-gray-200 text-left text-sm text-gray-600 font-semibold">
                            <th className="p-4">Học sinh</th>
                             <th className="p-4">Lớp</th>
                            <th className="p-4">Tên thuốc</th>
                            <th className="p-4">Ngày kết thúc</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayList.map((med) => (
                            <tr key={med.medicationId} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{med.studentName}</td>
                                <td className="p-4 text-sm text-gray-600">{med.className}</td>
                                <td className="p-4">{med.medicationName}</td>
                                <td className="p-4 text-sm text-gray-600">{new Date(med.endDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
  };

  const tabConfig = [
    { key: "pending", label: "Chờ xác nhận", icon: AlertTriangle },
    { key: "add", label: "Thêm thuốc", icon: PlusCircle },
    { key: "approved", label: "Thuốc đã duyệt", icon: Pill },
    { key: "completed", label: "Lịch sử", icon: History },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-center border-b border-gray-200">
        {tabConfig.map(tab => (
            <button key={tab.key} onClick={() => setMode(tab.key as any)} className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${mode === tab.key ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                <tab.icon size={16} />
                {tab.label}
            </button>
        ))}
      </div>

      {/* THÊM MỚI: Bộ lọc cho tab "Thuốc đã duyệt" */}
      {mode === 'approved' && (
        <div className="flex items-center justify-end p-4 bg-gray-50 rounded-lg border">
            <label htmlFor="filterToday" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <Filter size={16} />
                <span>Chỉ hiển thị thuốc cần uống hôm nay</span>
                <input
                    type="checkbox"
                    id="filterToday"
                    checked={filterToday}
                    onChange={(e) => setFilterToday(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            </label>
        </div>
      )}

      <div className="mt-4">
        {mode === 'add' ? (
          <MedicationFormForNurse onSaved={() => { setMode('approved'); }} />
        ) : (
          renderContent()
        )}
      </div>

      {/* Modal từ chối giữ nguyên */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-800">Lý do từ chối yêu cầu</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows={4}
              placeholder="Nhập lý do từ chối (ví dụ: thuốc không rõ nguồn gốc, sai liều lượng...)"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Hủy</button>
              <button onClick={handleReject} disabled={processingIds.has(selectedMedId!)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50">
                {processingIds.has(selectedMedId!) ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseMedications;