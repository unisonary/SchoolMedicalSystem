import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Calendar, Eye, Download } from "lucide-react";
import axios from "@/api/axiosInstance";

interface HealthDocument {
  documentId: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt?: string;
  views?: number;
  category?: string;
}

const LatestDocuments = () => {
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("/public/documents/latest");
        setDocuments(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const DocumentCard = ({ doc }: { doc: HealthDocument }) => (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={doc.imageUrl}
          alt={doc.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/400/300";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          {doc.category || "Sức khỏe"}
        </div>
        
        {/* Overlay content */}
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
          <div className="flex items-center space-x-4 text-white text-sm">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{doc.views || Math.floor(Math.random() * 1000 + 100)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{doc.createdAt || "Hôm nay"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-500 font-medium">Tài liệu</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-200">
          {doc.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
          {doc.content.substring(0, 100)}...
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/documents/${doc.documentId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group transition-colors duration-200"
          >
            Xem chi tiết
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const LoadingCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
            <FileText className="h-4 w-4 mr-2" />
            Tài liệu y tế
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tài liệu sức khỏe mới nhất
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Các tài liệu hữu ích và cập nhật về sức khỏe học đường, được biên soạn bởi các chuyên gia y tế
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <LoadingCard key={index} />
            ))
          ) : (
            documents.map((doc) => (
              <DocumentCard key={doc.documentId} doc={doc} />
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            to="/documents"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
          >
            Xem tất cả tài liệu
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestDocuments;