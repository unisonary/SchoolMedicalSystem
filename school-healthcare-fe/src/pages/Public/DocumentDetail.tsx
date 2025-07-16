import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";

interface HealthDocument {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
}

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<HealthDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios
        .get(`/public/documents/${id}`)
        .then((res) => {
          setDocument(res.data);
          setLoading(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch((err) => {
          console.error("Lỗi tải tài liệu:", err);
          setLoading(false);
        });
    }
  }, [id]);
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Không tìm thấy tài liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {document.title}
              </h1>
              <div className="w-24 h-1 bg-green-600 mx-auto rounded-full mb-8"></div>
            </div>
            
            <div className="mb-8">
              <img
                src={document.imageUrl}
                alt={document.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                onError={(e) => (e.currentTarget.src = "/fallback.png")}
              />
            </div>
            
            <div
              className="prose prose-lg max-w-none leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;