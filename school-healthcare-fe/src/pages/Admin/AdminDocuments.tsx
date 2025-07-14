import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface HealthDocument {
  documentId: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdDate?: string;
}

const AdminDocuments = () => {
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [form, setForm] = useState<Omit<HealthDocument, "documentId">>({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/documents");
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
      setDocuments(sorted);
    } catch {
      toast.error("Không thể tải danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_unsigned_preset");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dkodv14qy/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch {
      toast.error("Upload ảnh thất bại.");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = "";

      if (file) {
        const uploadedUrl = await uploadToCloudinary(file);
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      } else if (form.imageUrl?.trim()) {
        imageUrl = form.imageUrl.trim();
      }

      const payload = {
        title: form.title,
        content: form.content,
        imageUrl,
      };

      if (isEditing && editingId !== null) {
        await axios.put(`/admin/documents/${editingId}`, payload);
        toast.success("Cập nhật tài liệu thành công.");
      } else {
        await axios.post("/admin/documents", payload);
        toast.success("Đã thêm tài liệu mới.");
      }

      setForm({ title: "", content: "", imageUrl: "" });
      setFile(null);
      setIsEditing(false);
      setEditingId(null);
      fetchDocuments();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doc: HealthDocument) => {
    setForm({ title: doc.title, content: doc.content, imageUrl: doc.imageUrl });
    setEditingId(doc.documentId);
    setIsEditing(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id || isNaN(id)) {
      toast.error("ID không hợp lệ khi xoá.");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xoá tài liệu này?")) return;
    try {
      await axios.delete(`/admin/documents/${id}`);
      toast.success("Đã xoá tài liệu.");
      fetchDocuments();
    } catch {
      toast.error("Xoá thất bại.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Danh sách tài liệu sức khoẻ</h2>

      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.documentId} className="border p-4 rounded-lg shadow-sm bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-bold text-gray-700">{doc.title}</h4>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(doc)} className="text-blue-600 hover:text-blue-800">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(doc.documentId)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{doc.content}</p>
              {doc.imageUrl && (
                <img
                  src={doc.imageUrl}
                  alt="Ảnh tài liệu"
                  className="w-full max-h-60 object-contain rounded mt-3"
                />
              )}
              {doc.createdDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Ngày tạo: {new Date(doc.createdDate).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 border-t">
        <h3 className="text-md font-semibold mb-2">{isEditing ? "Cập nhật tài liệu" : "Thêm mới tài liệu"}</h3>
        <div className="space-y-3">
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Nội dung"
            rows={5}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <input
            type="file"
            className="w-full border rounded px-3 py-2"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Hoặc dán URL ảnh trực tiếp (tuỳ chọn)"
            value={form.imageUrl || ""}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDocuments;
