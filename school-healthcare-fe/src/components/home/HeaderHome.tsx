import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const HeaderHome = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-50 to-white shadow-lg border-b border-blue-100 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
          
          {/* Logo + Brand */}
          <div className="flex items-center space-x-4 group">
            <div className="relative">
              <img 
                src={logo} 
                alt="FPT Logo" 
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xl font-bold leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">FPT</span>
              <span className="text-gray-800 ml-1">School</span>
              <div className="text-sm text-gray-600 font-normal bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Health Care
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8 text-sm font-medium">
            <a 
              href="/home" 
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 group"
            >
              <span className="relative z-10">Trang chủ</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a 
              href="/documents" 
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 group"
            >
              <span className="relative z-10">Tài liệu</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a 
              href="/blogs" 
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 group"
            >
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
            <a 
              href="#contact" 
              className="relative text-gray-700 hover:text-blue-600 transition-all duration-300 group"
            >
              <span className="relative z-10">Liên hệ</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </a>
          </nav>

          {/* Search + Action */}
          <div className="flex items-center space-x-4 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative w-full lg:w-80 group">
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, bài viết..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white/70 backdrop-blur-sm transition-all duration-300 group-hover:shadow-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="hidden lg:inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Tìm kiếm</span>
            </button>

            {/* Login */}
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 px-5 py-3 text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 border border-blue-200 rounded-2xl hover:bg-blue-50 hover:shadow-md transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Đăng nhập</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderHome;