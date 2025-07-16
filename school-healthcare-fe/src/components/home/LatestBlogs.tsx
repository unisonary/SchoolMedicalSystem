import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Calendar, Clock, User, Heart, Share2 } from "lucide-react";
import axios from "@/api/axiosInstance";

interface BlogPost {
  blogId: number;
  title: string;
  content: string;
  imageUrl: string;
  author?: string;
  createdAt?: string;
  readTime?: number;
  category?: string;
  likes?: number;
}

const LatestBlogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("/public/blogs/latest");
        setBlogs(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const BlogCard = ({ blog, index }: { blog: BlogPost; index: number }) => (
    <div className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${
      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
    }`}>
      {/* Image */}
      <div className={`relative overflow-hidden ${index === 0 ? 'h-64' : 'h-48'}`}>
        <img
          src={blog.imageUrl}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = "/api/placeholder/600/400";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Category badge */}
        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          {blog.category || "Sức khỏe"}
        </div>
        
        {/* Overlay content */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-4 text-white text-sm mb-2">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{blog.author || "Bác sĩ FPT"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{blog.createdAt || "Hôm nay"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime || 5} phút đọc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="h-5 w-5 text-green-600" />
          <span className="text-sm text-gray-500 font-medium">Bài viết</span>
        </div>
        
        <h3 className={`font-bold text-gray-900 mb-3 leading-tight group-hover:text-green-600 transition-colors duration-200 ${
          index === 0 ? 'text-xl' : 'text-lg'
        }`}>
          {blog.title}
        </h3>
        
        <p className={`text-gray-600 mb-4 leading-relaxed line-clamp-3 ${
          index === 0 ? 'text-base' : 'text-sm'
        }`}>
          {blog.content.substring(0, index === 0 ? 150 : 100)}...
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/blogs/${blog.blogId}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm group transition-colors duration-200"
          >
            Đọc thêm
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors duration-200">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{blog.likes || Math.floor(Math.random() * 50 + 10)}</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingCard = ({ isLarge }: { isLarge?: boolean }) => (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse ${
      isLarge ? 'md:col-span-2 md:row-span-2' : ''
    }`}>
      <div className={`bg-gray-200 ${isLarge ? 'h-64' : 'h-48'}`}></div>
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
            <MessageSquare className="h-4 w-4 mr-2" />
            Blog y tế
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Bài viết Blog mới nhất
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Thông tin sức khỏe hữu ích và cập nhật từ các chuyên gia y tế, giúp gia đình và nhà trường chăm sóc sức khỏe tốt hơn
          </p>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <>
              <LoadingCard isLarge />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            blogs.map((blog, index) => (
              <BlogCard key={blog.blogId} blog={blog} index={index} />
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            to="/blogs"
            className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
          >
            Xem tất cả bài viết
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestBlogs;