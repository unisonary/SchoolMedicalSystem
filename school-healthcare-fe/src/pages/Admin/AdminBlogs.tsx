import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { Pencil, Trash2, BookOpen, Plus, Save, X, Upload, Link, Calendar, Eye } from "lucide-react";
import { toast } from "react-toastify";

interface BlogPost {
  blogId: number;
  title: string;
  content: string;
  imageUrl?: string;
  createdDate?: string;
}

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<Omit<BlogPost, "blogId">>({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/blogs");
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
      setBlogs(sorted);
    } catch {
      toast.error("Không thể tải danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
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
        await axios.put(`/admin/blogs/${editingId}`, payload);
        toast.success("Cập nhật bài viết thành công.");
      } else {
        await axios.post("/admin/blogs", payload);
        toast.success("Đã thêm bài viết mới.");
      }

      setForm({ title: "", content: "", imageUrl: "" });
      setFile(null);
      setIsEditing(false);
      setEditingId(null);
      fetchBlogs();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setForm({ title: blog.title, content: blog.content, imageUrl: blog.imageUrl });
    setEditingId(blog.blogId);
    setIsEditing(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id || isNaN(id)) {
      toast.error("ID không hợp lệ khi xoá.");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xoá bài viết này?")) return;
    try {
      await axios.delete(`/admin/blogs/${id}`);
      toast.success("Đã xoá bài viết.");
      fetchBlogs();
    } catch {
      toast.error("Xoá thất bại.");
    }
  };

  const handleCancel = () => {
    setForm({ title: "", content: "", imageUrl: "" });
    setFile(null);
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
          📝 Quản lý bài viết blog
        </h2>
        <p className="text-gray-600">Tạo và quản lý các bài viết blog thông tin sức khỏe</p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium">Tổng số bài viết</p>
            <p className="text-3xl font-bold text-purple-800">{blogs.length}</p>
          </div>
          <div className="p-3 bg-purple-200 rounded-full">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
          <h3 className="text-xl font-semibold text-green-800 flex items-center space-x-2">
            {isEditing ? (
              <>
                <Pencil className="w-5 h-5 text-green-600" />
                <span>✏️ Cập nhật bài viết</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-green-600" />
                <span>➕ Thêm bài viết mới</span>
              </>
            )}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề bài viết
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Nhập tiêu đề bài viết..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung bài viết
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              placeholder="Nhập nội dung bài viết..."
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tải ảnh lên
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              {file && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <Upload className="w-4 h-4 text-green-600" />
                  <span>Đã chọn: {file.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoặc dán URL ảnh
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl || ""}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm mới"}</span>
            </button>

            {isEditing && (
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all transform hover:scale-105 font-medium"
              >
                <X className="w-4 h-4" />
                <span>Hủy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <span>📋 Danh sách bài viết</span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {blogs.length} bài viết
            </span>
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có bài viết nào</p>
              <p className="text-gray-400 text-sm mt-2">Thêm bài viết đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <div key={blog.blogId} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  {/* Blog Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {blog.title}
                      </h4>
                      {blog.createdDate && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(blog.createdDate).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "short", 
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(blog)} 
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.blogId)} 
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">
                        {blog.content}
                      </p>
                    </div>
                    
                    {/* Blog Image */}
                    {blog.imageUrl && (
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <img
                          src={blog.imageUrl}
                          alt="Ảnh bài viết"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;