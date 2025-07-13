// src/pages/admin/AdminAccounts.tsx
import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { UserPlus, Trash2, Edit3, Search } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { CreateUserDTO, UpdateUserDTO } from "@/types/UserDTO";
import { useAuthStore } from "@/auth/useAuthStore";

const roles = ["Student", "Parent", "Nurse", "Manager", "Admin"];

const AdminAccounts = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("Student");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [createForm, setCreateForm] = useState<CreateUserDTO>({
    username: "",
    password: "",
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

  const handleSubmit = async () => {
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
      password: createForm.password || "123456",
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
          department: createForm.department,
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
          <input
            type="text"
            placeholder="Tên đăng nhập"
            className="w-full border rounded px-3 py-2 text-sm"
            value={createForm.username}
            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border rounded px-3 py-2 text-sm"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
          />
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={createForm.role}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Họ tên"
            className="w-full border rounded px-3 py-2 text-sm"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 text-sm"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
          />

          {/* Trường nhập phụ theo vai trò */}
          {createForm.role === "Student" && (
            <>
              <input
                type="text"
                placeholder="Giới tính"
                className="w-full border rounded px-3 py-2 text-sm"
                value={createForm.gender || ""}
                onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
              />
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={createForm.dateOfBirth || ""}
                onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })}
              />
              <input
                type="text"
                placeholder="Lớp học"
                className="w-full border rounded px-3 py-2 text-sm"
                value={createForm.class || ""}
                onChange={(e) => setCreateForm({ ...createForm, class: e.target.value })}
              />

              {/* Dropdown tìm phụ huynh */}
              <input
                type="text"
                placeholder="Tìm phụ huynh theo tên"
                className="w-full border rounded px-3 py-2 text-sm"
                value={parentQuery}
                onChange={(e) => setParentQuery(e.target.value)}
                onFocus={() => parentQuery.length >= 2 && setShowParentDropdown(true)}
                onBlur={() => setTimeout(() => setShowParentDropdown(false), 300)}
              />
              {showParentDropdown && (
                <div className="border rounded bg-white max-h-40 overflow-auto text-sm shadow-md z-50 relative">
                  {parentResults.length === 0 ? (
                    <div className="p-2 text-gray-500">Không tìm thấy</div>
                  ) : (
                    parentResults.map((p) => (
                      <div
                        key={p.parentId}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          setCreateForm({ ...createForm, parentId: p.parentId });
                          setParentQuery(`${p.name} (${p.email})`);
                          setParentSelected(true);
                        }}
                      >
                        {p.name} – {p.email} – {p.phone}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {createForm.role === "Parent" && (
            <input
              type="text"
              placeholder="Số điện thoại"
              className="w-full border rounded px-3 py-2 text-sm"
              value={createForm.phone || ""}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            />
          )}

          {createForm.role === "Nurse" && (
            <input
              type="text"
              placeholder="Chuyên môn"
              className="w-full border rounded px-3 py-2 text-sm"
              value={createForm.specialization || ""}
              onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
            />
          )}

          {createForm.role === "Manager" && (
            <>
              <input
                type="text"
                placeholder="Phòng ban"
                className="w-full border rounded px-3 py-2 text-sm"
                value={createForm.department || ""}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
              />
              <input
                type="text"
                placeholder="Chức vụ"
                className="w-full border rounded px-3 py-2 text-sm"
                value={createForm.position || ""}
                onChange={(e) => setCreateForm({ ...createForm, position: e.target.value })}
              />
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

      {/* Nút action */}
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
      </div>
    </div>
  </Modal>
)}

    </div>
  );
};

export default AdminAccounts;
