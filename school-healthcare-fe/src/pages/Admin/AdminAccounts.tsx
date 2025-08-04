// school-healthcare-fe/src/pages/Admin/AdminAccounts.tsx
import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { UserPlus, Trash2, Edit3, Search, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { CreateUserDTO, UpdateUserDTO } from "@/types/UserDTO";
import { useAuthStore } from "@/auth/useAuthStore";

const roles = ["Student", "Parent", "Nurse", "Manager", "Admin"];
const specializations = ["Nhi khoa", "Đa khoa", "Y tế học đường", "Tim mạch", "Ngoại khoa", "Nội khoa"];
const positions = ["Trưởng phòng", "Phó phòng"];

const AdminAccounts = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState("Student");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/admin/classes")
      .then((res) => setClasses(res.data))
      .catch(() => toast.error("Không thể tải danh sách lớp học"));
  }, []);

  const [createForm, setCreateForm] = useState<CreateUserDTO>({
    username: "",
    role: "Student",
    name: "",
    email: "",
    createdBy: user?.userId || 0,
  });

  const [updateForm, setUpdateForm] = useState<UpdateUserDTO>({
    userId: 0,
    username: "",
    role: "Student",
    isActive: true,
  });

  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState<any[]>([]);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [parentSelected, setParentSelected] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/users?role=${roleFilter}`);
      setUsers(res.data);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/search?query=${searchQuery}&role=${roleFilter}`);
      setUsers(res.data);
    } catch {
      toast.error("Lỗi khi tìm kiếm");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    if (!createForm.role || createForm.role !== "Student" || parentSelected) return;
    const timeout = setTimeout(async () => {
      if (parentQuery.length < 2) {
        setShowParentDropdown(false);
        return;
      }
      try {
        const res = await axios.get(`/admin/search-parents?query=${encodeURIComponent(parentQuery)}`);
        setParentResults(res.data);
        setShowParentDropdown(true);
      } catch {
        toast.error("Lỗi khi tìm phụ huynh");
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [parentQuery, parentSelected, createForm.role]);

  const validateEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 254 || trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.') || trimmedEmail.split('@')[0].length > 64) {
      return false;
    }
    return true;
  };

  const validateDateOfBirth = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    if (!createForm.username?.trim()) errors.username = "Tên đăng nhập không được để trống";
    if (!createForm.name?.trim()) errors.name = "Họ tên không được để trống";
    if (!createForm.email?.trim()) {
      errors.email = "Email không được để trống";
    } else if (!validateEmail(createForm.email)) {
      errors.email = "Email không hợp lệ";
    }

    switch (createForm.role) {
      case "Student":
        if (!createForm.gender) errors.gender = "Vui lòng chọn giới tính";
        if (!createForm.dateOfBirth) {
          errors.dateOfBirth = "Vui lòng chọn ngày sinh";
        } else if (!validateDateOfBirth(createForm.dateOfBirth)) {
          errors.dateOfBirth = "Ngày sinh phải là ngày trong quá khứ";
        }
        if (!createForm.class) errors.class = "Vui lòng chọn lớp học";
        if (!createForm.parentId) errors.parentId = "Vui lòng chọn phụ huynh";
        break;
      case "Parent":
        if (!createForm.phone?.trim()) errors.phone = "Số điện thoại không được để trống";
        break;
      case "Nurse":
        if (!createForm.specialization) errors.specialization = "Vui lòng chọn chuyên môn";
        break;
      case "Manager":
        if (!createForm.position) errors.position = "Vui lòng chọn chức vụ";
        break;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!editMode && !validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    try {
      if (editMode) {
        await axios.put("/admin/update-user", updateForm);
        toast.success("Cập nhật tài khoản thành công");
      } else {
        const payload = buildPayloadByRole();
        await axios.post("/admin/create-account", payload);
        toast.success("Tạo tài khoản thành công");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data || "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.");
    }
  };

  const buildPayloadByRole = (): Partial<CreateUserDTO> => {
    const base = {
      username: createForm.username,
      role: createForm.role,
      name: createForm.name,
      email: createForm.email,
      createdBy: user?.userId || 0,
    };
    switch (createForm.role) {
      case "Student":
        return { ...base, gender: createForm.gender, dateOfBirth: createForm.dateOfBirth, class: createForm.class, parentId: createForm.parentId };
      case "Parent":
        return { ...base, phone: createForm.phone };
      case "Nurse":
        return { ...base, specialization: createForm.specialization };
      case "Manager":
        return { ...base, department: "Phòng Y tế", position: createForm.position };
      default:
        return base;
    }
  };

  const handleEdit = (user: any) => {
    setEditMode(true);
    setUpdateForm({
      userId: user.userId,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditMode(false);
    setCreateForm({
      username: "",
      role: "Student",
      name: "",
      email: "",
      createdBy: user?.userId || 0,
    });
    setParentQuery("");
    setParentSelected(false);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm("Xác nhận vô hiệu hóa tài khoản này?")) return;
    try {
      await axios.put(`/admin/deactivate/${userId}`);
      toast.success("Đã vô hiệu hóa tài khoản");
      fetchUsers();
    } catch {
      toast.error("Lỗi khi vô hiệu hóa");
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setCreateForm({ ...createForm, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
    if (field === "role") {
      setParentQuery("");
      setParentSelected(false);
    }
  };

  const getFieldValue = (field: string): string => (createForm as any)[field] || "";

  const renderFormField = (field: string, placeholder: string, type: string = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{placeholder}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors[field] ? 'border-red-500' : 'border-gray-300'}`}
        value={getFieldValue(field)}
        onChange={(e) => handleFormChange(field, e.target.value)}
      />
      {formErrors[field] && <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>}
    </div>
  );

  const renderSelectField = (field: string, options: string[], placeholder: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{placeholder}</label>
      <select
        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formErrors[field] ? 'border-red-500' : 'border-gray-300'}`}
        value={getFieldValue(field)}
        onChange={(e) => handleFormChange(field, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      {formErrors[field] && <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>}
    </div>
  );

  const getActiveUsers = () => users.filter((u: any) => u.isActive);
  const getInactiveUsers = () => users.filter((u: any) => !u.isActive);

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-8 h-8 text-blue-600" /></div>
          Quản lý tài khoản
        </h2>
        <p className="text-gray-600">Tạo và quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-blue-600 text-sm font-medium">Tổng tài khoản</p>
                    <p className="text-3xl font-bold text-blue-800">{users.length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full"><Users className="w-6 h-6 text-blue-600"/></div>
            </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-green-600 text-sm font-medium">Tài khoản hoạt động</p>
                    <p className="text-3xl font-bold text-green-800">{getActiveUsers().length}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full"><UserCheck className="w-6 h-6 text-green-600"/></div>
            </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-red-600 text-sm font-medium">Tài khoản vô hiệu hóa</p>
                    <p className="text-3xl font-bold text-red-800">{getInactiveUsers().length}</p>
                </div>
                <div className="p-3 bg-red-200 rounded-full"><UserX className="w-6 h-6 text-red-600"/></div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Filter and Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo vai trò</label>
                <select className="border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <input 
                        type="text" 
                        className="px-4 py-2 text-sm outline-none flex-1 focus:ring-2 focus:ring-blue-500" 
                        placeholder={roleFilter === 'Parent' ? "Tìm theo username, tên, SĐT..." : "Tìm theo username hoặc tên..."} 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="px-4 bg-gray-100 hover:bg-gray-200" onClick={handleSearch}><Search size={16} /></button>
                </div>
              </div>
            </div>
            <button onClick={openCreateModal} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-md transition-transform hover:scale-105">
              <UserPlus size={16} /> Thêm tài khoản
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-gray-400 animate-pulse" /></div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-gray-400" /></div>
              <p className="text-gray-500 text-lg">Không có tài khoản nào</p>
              <p className="text-gray-400 text-sm mt-2">Thêm tài khoản đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">ID</th>
                    <th className="py-3 px-4 text-left font-semibold">Username</th>
                    <th className="py-3 px-4 text-left font-semibold">Họ và tên</th>
                    <th className="py-3 px-4 text-left font-semibold">Vai trò</th>
                    <th className="py-3 px-4 text-left font-semibold">Trạng thái</th>
                    {roleFilter === 'Parent' && (
                    <th className="py-3 px-4 text-left font-semibold">Số điện thoại</th>
                    )}
                    <th className="py-3 px-4 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userId} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{u.userId}</td>
                      <td className="py-3 px-4 text-gray-700">{u.username}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{u.name || u.username}</td>
                      <td className="py-3 px-4"><span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">{u.role}</span></td>
                      <td className="py-3 px-4"><span className={`text-xs font-semibold px-3 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.isActive ? "Hoạt động" : "Vô hiệu hóa"}</span></td>
                      {roleFilter === 'Parent' && (
                      <td className="py-3 px-4 text-gray-700">{u.phoneNumber || "Chưa có"}</td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(u)} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg" title="Chỉnh sửa"><Edit3 size={16} /></button>
                          <button onClick={() => handleDeactivate(u.userId)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg" title="Vô hiệu hóa"><Trash2 size={16} /></button>
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

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMode ? "✏️ Cập nhật tài khoản" : "➕ Tạo tài khoản mới"}>
          <div className="space-y-6">
            {!editMode ? (
              <>
                {/* CREATE MODE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={createForm.role} onChange={(e) => handleFormChange("role", e.target.value)}>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderFormField("username", "Tên đăng nhập")}
                  {renderFormField("name", "Họ và tên")}
                </div>
                {renderFormField("email", "Email", "email")}

                {createForm.role === "Student" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderSelectField("gender", ["Nam", "Nữ"], "-- Chọn giới tính --")}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                        <input type="date" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`} value={createForm.dateOfBirth || ""} onChange={(e) => handleFormChange("dateOfBirth", e.target.value)} />
                        {formErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{formErrors.dateOfBirth}</p>}
                      </div>
                    </div>
                    {renderSelectField("class", classes, "-- Chọn lớp học --")}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phụ huynh</label>
                      <input type="text" placeholder="Tìm phụ huynh theo tên hoặc SĐT..." className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.parentId ? 'border-red-500' : 'border-gray-300'}`} value={parentQuery} onChange={(e) => {setParentQuery(e.target.value); setParentSelected(false); if (formErrors.parentId) setFormErrors({...formErrors, parentId: ""});}} onFocus={() => parentQuery.length >= 2 && setShowParentDropdown(true)} onBlur={() => setTimeout(() => setShowParentDropdown(false), 300)} />
                      {formErrors.parentId && <p className="text-red-500 text-xs mt-1">{formErrors.parentId}</p>}
                      {showParentDropdown && (
                        <div className="absolute top-full left-0 right-0 border rounded-lg bg-white max-h-40 overflow-auto text-sm shadow-lg z-50 mt-1">
                          {parentResults.length > 0 ? parentResults.map((p) => (
                            <div key={p.parentId} className="p-3 hover:bg-blue-50 cursor-pointer border-b" onClick={() => {handleFormChange("parentId", p.parentId); setParentQuery(`${p.name} (${p.email})`); setParentSelected(true); setShowParentDropdown(false);}}>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-gray-600 text-xs">{p.email} • {p.phone}</div>
                            </div>
                          )) : <div className="p-3 text-gray-500">Không tìm thấy</div>}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {createForm.role === "Parent" && renderFormField("phone", "Số điện thoại")}
                {createForm.role === "Nurse" && renderSelectField("specialization", specializations, "-- Chọn chuyên môn --")}
                {createForm.role === "Manager" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                      <input type="text" className="w-full border rounded-lg px-4 py-3 bg-gray-100" value="Phòng Y tế" readOnly />
                    </div>
                    {renderSelectField("position", positions, "-- Chọn chức vụ --")}
                  </>
                )}
              </>
            ) : (
              <>
                {/* EDIT MODE - Completed */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                    <input type="text" className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={updateForm.username} onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                    <select className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={updateForm.role} onChange={(e) => setUpdateForm({ ...updateForm, role: e.target.value })}>
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={String(updateForm.isActive)} onChange={(e) => setUpdateForm({ ...updateForm, isActive: e.target.value === 'true' })}>
                      <option value="true">Hoạt động</option>
                      <option value="false">Vô hiệu hóa</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Hủy</button>
              <button onClick={handleSubmit} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                {editMode ? "Lưu thay đổi" : "Tạo tài khoản"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminAccounts;
