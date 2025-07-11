// NurseMedicalEvents.tsx - Form nhỏ gọn hơn
import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { Pencil, Trash2, Plus, Heart, Calendar, MapPin, UserCheck, AlertCircle, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

// interface StudentSearchResult {
//   studentId: number;
//   name: string;
//   parentName: string;
//   parentPhone: string;
//   className: string;
// }

type MedicalEvent = {
  eventId: number;
  studentId: number;
  studentName: string;
  eventType: string;
  description: string;
  severity?: string;
  location: string;
  treatmentGiven?: string;
  parentNotified: boolean;
  followUpRequired: boolean;
  date: string;
};

const defaultEvent: MedicalEvent = {
  eventId: 0,
  studentId: 0,
  studentName: "",
  eventType: "",
  description: "",
  severity: "",
  location: "",
  treatmentGiven: "",
  parentNotified: false,
  followUpRequired: false,
  date: "",
};

const NurseMedicalEvents = () => {
  const [parentPhone, setParentPhone] = useState(""); 
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MedicalEvent | null>(null);
  const [form, setForm] = useState<MedicalEvent>(defaultEvent);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentValid, setStudentValid] = useState<boolean | null>(null);
  const [studentName, setStudentName] = useState<string>("");

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/nurse/medical-events");
      setEvents(res.data);
    } catch {
      toast.error("Không thể tải danh sách sự kiện.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      if (name === "parentNotified") {
        setForm((prev) => ({ ...prev, parentNotified: checked, followUpRequired: !checked }));
      } else if (name === "followUpRequired") {
        setForm((prev) => ({ ...prev, followUpRequired: checked, parentNotified: !checked }));
      } else {
        setForm((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!editing && !studentValid) {
      toast.error("Vui lòng nhập mã học sinh hợp lệ trước khi tạo.");
      return;
    }
  
    try {
      if (editing) {
        const updateData = {
          eventType: form.eventType,
          description: form.description,
          severity: form.severity,
          treatmentGiven: form.treatmentGiven,
          location: form.location,
        };
        await axios.put(`/nurse/medical-events/${editing.eventId}`, updateData);
        toast.success("Cập nhật thành công.");
      } else {
        const res = await axios.post("/nurse/medical-events", form);
        const createdId = res.data?.eventId;
        toast.success(`Đã tạo sự kiện y tế với mã: ${createdId}`);
        setTimeout(() => {
          if (window.confirm(`Sự kiện y tế có mã là #${createdId}. Bạn có muốn chuyển sang phần xuất vật tư?`)) {
            localStorage.setItem("nurse-tab", "supplylog");
            window.dispatchEvent(new Event("storage")); // để đồng bộ tab
            navigate("/nurse/dashboard");
          }
        }, 200);
      }
  
      setOpen(false);
      setForm(defaultEvent);
      setEditing(null);
      fetchEvents();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi lưu dữ liệu.");
    }
  };
  
  

  const confirmDelete = (id: number) => {
    setConfirmDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axios.delete(`/nurse/medical-events/${confirmDeleteId}`);
      toast.success("Đã xoá sự kiện.");
      setShowDeleteModal(false);
      setConfirmDeleteId(null);
      fetchEvents();
    } catch {
      toast.error("Không thể xoá.");
    }
  };

  const startEdit = (event: MedicalEvent) => {
    setForm(event);
    setEditing(event);
    setOpen(true);
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "Tai nạn": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "Bệnh tật": return <Activity className="w-4 h-4 text-blue-500" />;
      case "Thương tích": return <Heart className="w-4 h-4 text-red-500" />;
      case "Trường hợp khẩn cấp": return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Heart className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🏥 Quản lý sự kiện y tế</h2>
        <p className="text-gray-600">Theo dõi và ghi nhận các sự kiện y tế trong trường</p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => { setOpen(true); setForm(defaultEvent); setEditing(null); }}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        >
          <Plus size={20} />
          <span>Thêm sự kiện mới</span>
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span>Danh sách sự kiện y tế</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {events.length}
            </span>
          </h3>
        </div>

        <div className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có sự kiện y tế nào</p>
              <p className="text-gray-400 text-sm mt-2">Hãy thêm sự kiện y tế mới để bắt đầu theo dõi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">STT</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Mã sự kiện</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Học sinh</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Loại sự kiện</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Mô tả</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Ngày</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Địa điểm</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={event.eventId} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="p-4 font-medium text-gray-600">{index + 1}</td>
                      <td className="p-4 text-sm text-gray-600 font-mono">#{event.eventId}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {event.studentName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{event.studentName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(event.eventType)}
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {event.eventType}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs">
                        <div className="truncate" title={event.description}>
                          {event.description || "Không có mô tả"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => startEdit(event)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(event.eventId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* Add/Edit Modal - FORM NHỎ GỌN HỢP */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? "Chỉnh sửa sự kiện y tế" : "Thêm sự kiện y tế mới"}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Student Info - Refactored Search by Name */}
{/* Student Info - Refactored Search by Name */}
{!editing && (
  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
    <div className="flex items-center space-x-2 mb-2">
      <UserCheck className="w-4 h-4 text-blue-600" />
      <span className="font-medium text-gray-800 text-sm">Tìm học sinh</span>
    </div>
    <div className="relative">
      <input
        type="text"
        placeholder="Nhập tên học sinh để tìm kiếm..."
        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        value={studentName}
        onChange={async (e) => {
          const keyword = e.target.value;
          setStudentName(keyword);
          if (keyword.length < 2) return;
          try {
            const res = await axios.get(`/student/search?name=${encodeURIComponent(keyword)}`);
            setSearchResults(res.data); // [{ studentId, name, parentName, parentPhone, className }]
            setShowDropdown(true);
          } catch {
            toast.error("Lỗi khi tìm kiếm học sinh.");
          }
        }}
      />

      {/* Dropdown kết quả */}
      {showDropdown && searchResults.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded-md shadow-md mt-1 w-full max-h-48 overflow-auto">
          {searchResults.map((stu) => (
            <li
              key={stu.studentId}
              onClick={() => {
                setForm((prev) => ({ ...prev, studentId: stu.studentId }));
                setStudentName(stu.name);
                setParentPhone(stu.parentPhone); // 👈 lấy số điện thoại phụ huynh
                setStudentValid(true);
                setShowDropdown(false);
              }}
              className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
            >
              <div className="font-medium">{stu.name}</div>
              <div className="text-xs text-gray-500">
                PH: {stu.parentName} - Lớp: {stu.className}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Xác nhận đã chọn */}
      {studentValid && (
        <div className="mt-2 text-green-600 text-xs space-y-1">
          <div>✅ Đã chọn học sinh: {studentName}</div>
          <div>📞 SĐT phụ huynh: <span className="font-semibold text-gray-800">{parentPhone}</span></div>
        </div>
      )}
    </div>
  </div>
)}



          {/* Form Fields - Compact Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Loại sự kiện <span className="text-red-500">*</span>
              </label>
              <select
                name="eventType"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.eventType}
                onChange={handleChange}
              >
                <option value="">-- Chọn loại --</option>
                <option value="Tai nạn">Tai nạn</option>
                <option value="Bệnh tật">Bệnh tật</option>
                <option value="Thương tích">Thương tích</option>
                <option value="Trường hợp khẩn cấp">Khẩn cấp</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mức độ <span className="text-red-500">*</span>
              </label>
              <select
                name="severity"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.severity}
                onChange={handleChange}
              >
                <option value="">-- Chọn mức độ --</option>
                <option value="Nhẹ">Nhẹ</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Nặng">Nặng</option>
                <option value="Nguy kịch">Nguy kịch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                name="location"
                type="text"
                placeholder="Ví dụ: Sân chơi, A1..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Xử lý
              </label>
              <input
                name="treatmentGiven"
                type="text"
                placeholder="Cách xử lý"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.treatmentGiven}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Mô tả chi tiết sự kiện..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Notification Status - Compact */}
          {!editing && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-2">Trạng thái thông báo</div>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-xs">
                  <input
                    type="checkbox"
                    name="parentNotified"
                    checked={form.parentNotified}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Thông báo PH</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input
                    type="checkbox"
                    name="followUpRequired"
                    checked={form.followUpRequired}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Tạo lịch hẹn với PH</span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {editing ? "Cập nhật" : "Tạo sự kiện"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium text-red-800 text-sm">Bạn có chắc chắn muốn xóa sự kiện này?</p>
              <p className="text-xs text-red-600">Hành động này không thể hoàn tác.</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NurseMedicalEvents;