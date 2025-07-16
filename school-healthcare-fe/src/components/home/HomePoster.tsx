import { ArrowRight, Shield, Heart, Users, CheckCircle } from "lucide-react";

const HomePoster = () => {
  const features = [
    "Theo dõi sức khỏe học sinh",
    "Quản lý lịch sử điều trị",
    "Chương trình tiêm chủng",
    "Báo cáo sức khỏe định kỳ"
  ];

  const stats = [
    { number: "10K+", label: "Học sinh" },
    { number: "50+", label: "Trường học" },
    { number: "98%", label: "Hài lòng" },
    { number: "24/7", label: "Hỗ trợ" }
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Nội dung bên trái */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Chào mừng đến với FPT School Health
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Nơi tuyệt vời để
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> nhận sự chăm sóc</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Vượt qua mọi rào cản và mọi vấn đề khác. Theo dõi sức khỏe, lịch sử điều trị 
              và tiêm chủng cho học sinh một cách dễ dàng và hiệu quả.
            </p>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => window.location.href = "/login"}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button 
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                Tìm hiểu thêm
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hình ảnh bác sĩ bên phải */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/src/assets/logo.png"
                alt="Healthcare Professional"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
              
              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg transform rotate-6 hover:rotate-12 transition-transform duration-300">
                <Heart className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Chăm sóc</p>
                <p className="text-xs text-gray-500">Tận tâm</p>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg transform -rotate-6 hover:-rotate-12 transition-transform duration-300">
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700">Cộng đồng</p>
                <p className="text-xs text-gray-500">Kết nối</p>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl transform rotate-6 scale-105 opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="currentColor" 
            fillOpacity="0.1" 
            d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            className="text-blue-600"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HomePoster;