// src/pages/admin/AdminAccounts.tsx
import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { UserPlus, Trash2, Edit3, Search } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { CreateUserDTO, UpdateUserDTO } from "@/types/UserDTO";
import { useAuthStore } from "@/auth/useAuthStore";

const roles = ["Student", "Parent", "Nurse", "Manager", "Admin"];
const specializations = ["Nhi khoa", "Đa khoa", "Y tế học đường", "Tim mạch", "Ngoại khoa", "Nội khoa"];
const positions = ["Trưởng phòng", "Phó phòng"];

const AdminAccounts = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("Student");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    axios.get("/admin/classes")
      .then((res) => setClasses(res.data))
      .catch(() => toast.error("Không thể tải danh sách lớp học"));
  }, []);

  const [createForm, setCreateForm] = useState<CreateUserDTO>({
    username: "",
    // password: "",
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

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    if (!createForm.role || createForm.role !== "Student") return;
    if (parentSelected) return;
    const timeout = setTimeout(async () => {
      if (parentQuery.length < 2) {
        setShowParentDropdown(false);
        return;
      }
      try {
        const res = await axios.get(`/admin/search-parents?name=${encodeURIComponent(parentQuery)}`);
        setParentResults(res.data);
        setShowParentDropdown(true);
      } catch {
        toast.error("Lỗi khi tìm phụ huynh");
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [parentQuery, parentSelected, createForm.role]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/admin/users?role=${roleFilter}`);
      setUsers(res.data);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return false;
    
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Additional checks
    const trimmedEmail = email.trim();
    
    // Check basic format
    if (!emailRegex.test(trimmedEmail)) return false;
    
    // Check length constraints
    if (trimmedEmail.length > 254) return false;
    
    // Check for consecutive dots
    if (trimmedEmail.includes('..')) return false;
    
    // Check if starts or ends with dot
    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) return false;
    
    // Check local part (before @) length
    const localPart = trimmedEmail.split('@')[0];
    if (localPart.length > 64) return false;
    
    return true;
  };

  // Date validation function
  const validateDateOfBirth = (dateString: string): boolean => {
    const today = new Date();
    const selectedDate = new Date(dateString);
    return selectedDate < today;
  };

  // Form validation function
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Common validations
    if (!createForm.username?.trim()) {
      errors.username = "Tên đăng nhập không được để trống";
    }
    // if (!createForm.password?.trim()) {
    //   errors.password = "Mật khẩu không được để trống";
    // }
    if (!createForm.name?.trim()) {
      errors.name = "Họ tên không được để trống";
    }
    if (!createForm.email?.trim()) {
      errors.email = "Email không được để trống";
    } else if (!validateEmail(createForm.email)) {
      errors.email = "Email không hợp lệ";
    }

    // Role-specific validations
    switch (createForm.role) {
      case "Student":
        if (!createForm.gender) {
          errors.gender = "Vui lòng chọn giới tính";
        }
        if (!createForm.dateOfBirth) {
          errors.dateOfBirth = "Vui lòng chọn ngày sinh";
        } else if (!validateDateOfBirth(createForm.dateOfBirth)) {
          errors.dateOfBirth = "Ngày sinh phải là ngày trong quá khứ";
        }
        if (!createForm.class) {
          errors.class = "Vui lòng chọn lớp học";
        }
        if (!createForm.parentId) {
          errors.parentId = "Vui lòng chọn phụ huynh";
        }
        break;
      case "Parent":
        if (!createForm.phone?.trim()) {
          errors.phone = "Số điện thoại không được để trống";
        }
        break;
      case "Nurse":
        if (!createForm.specialization) {
          errors.specialization = "Vui lòng chọn chuyên môn";
        }
        break;
      case "Manager":
        if (!createForm.position) {
          errors.position = "Vui lòng chọn chức vụ";
        }
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
        console.log("Payload gửi BE:", payload);
        await axios.post("/admin/create-account", payload);
        toast.success("Tạo tài khoản thành công");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error("❌ Lỗi khi tạo account:", err);
      toast.error(err?.response?.data || "Tạo tài khoản thất bại. Vui lòng kiểm tra dữ liệu đầu vào.");
    }
  };

  const buildPayloadByRole = (): Partial<CreateUserDTO> => {
    const base = {
      username: createForm.username,
      // password: createForm.password || "123456",
      role: createForm.role,
      name: createForm.name,
      email: createForm.email,
      createdBy: user?.userId || 0,
    };

    switch (createForm.role) {
      case "Student":
        return {
          ...base,
          gender: createForm.gender,
          dateOfBirth: createForm.dateOfBirth,
          class: createForm.class,
          parentId: createForm.parentId,
        };
      case "Parent":
        return {
          ...base,
          phone: createForm.phone,
        };
      case "Nurse":
        return {
          ...base,
          specialization: createForm.specialization,
        };
      case "Manager":
        return {
          ...base,
          department: "Phòng Y tế",
          position: createForm.position,
        };
      case "Admin":
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
      password: "",
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

  const handleSearch = async () => {
    try {
      const res = await axios.get(`/admin/search?query=${searchQuery}`);
      setUsers(res.data);
    } catch {
      toast.error("Lỗi khi tìm kiếm");
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setCreateForm({ ...createForm, [field]: value } as CreateUserDTO);
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
    
    // Reset parent selection when role changes
    if (field === "role") {
      setParentQuery("");
      setParentSelected(false);
    }
  };

  const getFieldValue = (field: string): string => {
    return (createForm as any)[field] || "";
  };

  const renderFormField = (field: string, placeholder: string, type: string = "text") => (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full border rounded px-3 py-2 text-sm ${formErrors[field] ? 'border-red-500' : 'border-gray-300'}`}
        value={getFieldValue(field)}
        onChange={(e) => handleFormChange(field, e.target.value)}
      />
      {formErrors[field] && <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>}
    </div>
  );

  const renderSelectField = (field: string, options: string[], placeholder: string) => (
    <div>
      <select
        className={`w-full border rounded px-3 py-2 text-sm ${formErrors[field] ? 'border-red-500' : 'border-gray-300'}`}
        value={getFieldValue(field)}
        onChange={(e) => handleFormChange(field, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {formErrors[field] && <p className="text-red-500 text-xs mt-1">{formErrors[field]}</p>}
    </div>
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex items-center gap-3">
          <select className="border px-3 py-2 rounded-lg text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="flex border rounded-lg overflow-hidden">
            <input
              type="text"
              className="px-3 py-2 text-sm outline-none"
              placeholder="Tìm theo username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="px-3 bg-gray-100 hover:bg-gray-200" onClick={handleSearch}>
              <Search size={16} />
            </button>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          <UserPlus size={16} /> Thêm tài khoản
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-left">Vai trò</th>
              <th className="py-2 px-4 text-left">Trạng thái</th>
              <th className="py-2 px-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">Không có dữ liệu</td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.userId} className="border-t">
                  <td className="py-2 px-4">{u.userId}</td>
                  <td className="py-2 px-4">{u.username}</td>
                  <td className="py-2 px-4">{u.role}</td>
                  <td className="py-2 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={() => handleEdit(u)} className="text-blue-500 hover:text-blue-700"><Edit3 size={16} /></button>
                    <button onClick={() => handleDeactivate(u.userId)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editMode ? "Cập nhật người dùng" : "Tạo tài khoản"}
        >
          <div className="space-y-4">
            {/* CREATE MODE */}
            {!editMode && (
              <>
                {/* Role Selection */}
                <div>
                  <select 
                    className="w-full border rounded px-3 py-2 text-sm border-gray-300" 
                    value={createForm.role} 
                    onChange={(e) => handleFormChange("role", e.target.value)}
                  >
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Common Fields */}
                {renderFormField("username", "Tên đăng nhập")}
                {/* {renderFormField("password", "Mật khẩu", "password")} */}
                {renderFormField("name", "Họ tên")}
                {renderFormField("email", "Email", "email")}

                {/* Role-specific Fields */}
                {createForm.role === "Student" && (
                  <>
                    {renderSelectField("gender", ["Nam", "Nữ"], "-- Chọn giới tính --")}
                    
                    <div>
                      <input
                        type="date"
                        className={`w-full border rounded px-3 py-2 text-sm ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                        value={createForm.dateOfBirth || ""}
                        onChange={(e) => handleFormChange("dateOfBirth", e.target.value)}
                      />
                      {formErrors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{formErrors.dateOfBirth}</p>}
                    </div>

                    {renderSelectField("class", classes, "-- Chọn lớp --")}

                    {/* Parent Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm phụ huynh theo tên"
                        className={`w-full border rounded px-3 py-2 text-sm ${formErrors.parentId ? 'border-red-500' : 'border-gray-300'}`}
                        value={parentQuery}
                        onChange={(e) => {
                          setParentQuery(e.target.value);
                          setParentSelected(false);
                          if (formErrors.parentId) {
                            setFormErrors({ ...formErrors, parentId: "" });
                          }
                        }}
                        onFocus={() => parentQuery.length >= 2 && setShowParentDropdown(true)}
                        onBlur={() => setTimeout(() => setShowParentDropdown(false), 300)}
                      />
                      {formErrors.parentId && <p className="text-red-500 text-xs mt-1">{formErrors.parentId}</p>}
                      
                      {showParentDropdown && (
                        <div className="absolute top-full left-0 right-0 border rounded bg-white max-h-40 overflow-auto text-sm shadow-md z-50">
                          {parentResults.length === 0 ? (
                            <div className="p-2 text-gray-500">Không tìm thấy</div>
                          ) : (
                            parentResults.map((p) => (
                              <div
                                key={p.parentId}
                                className="p-2 hover:bg-blue-100 cursor-pointer"
                                onClick={() => {
                                  handleFormChange("parentId", p.parentId);
                                  setParentQuery(`${p.name} (${p.email})`);
                                  setParentSelected(true);
                                  setShowParentDropdown(false);
                                }}
                              >
                                {p.name} – {p.email} – {p.phone}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {createForm.role === "Parent" && (
                  <>
                    {renderFormField("phone", "Số điện thoại")}
                  </>
                )}

                {createForm.role === "Nurse" && (
                  <>
                    {renderSelectField("specialization", specializations, "-- Chọn chuyên môn --")}
                  </>
                )}

                {createForm.role === "Manager" && (
                  <>
                    <div>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm border-gray-300 bg-gray-100"
                        value="Phòng Y tế"
                        readOnly
                      />
                    </div>
                    {renderSelectField("position", positions, "-- Chọn chức vụ --")}
                  </>
                )}
              </>
            )}

            {/* EDIT MODE */}
            {editMode && (
              <>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={updateForm.username}
                  onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
                />
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={updateForm.role}
                  onChange={(e) => setUpdateForm({ ...updateForm, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
              >
                {editMode ? "Lưu thay đổi" : "Tạo mới"}
              </button>
              <p className="text-xs text-gray-500 italic">
                * Mật khẩu mặc định cho tài khoản mới là <strong>123456</strong>
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminAccounts;