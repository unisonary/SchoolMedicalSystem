// src/components/layout/Footer.tsx
import background from '@/assets/fpt.png';

const Footer = () => {
  return (
    <footer className="relative mt-16">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-orange-500 to-green-600"></div>
      
      <div
        className="relative text-white"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay */}
        <div className="bg-gradient-to-br from-blue-900/90 via-orange-900/80 to-green-900/90">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* School Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">🏫</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Trường Tiểu học FPT</h2>
                </div>
                
                <div className="space-y-3 text-blue-100">
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-300 mt-1">📍</span>
                    <p className="leading-relaxed">
                      Lô E2a-7, Đường D1, Khu Công nghệ cao,<br />
                      Phường Tăng Nhơn Phú, TPHCM
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-green-300">📞</span>
                    <p className="font-semibold">0764023678</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-300">📧</span>
                    <a 
                      href="mailto:fptschoolhealthcare_swpproject@gmail.com" 
                      className="text-blue-200 hover:text-white transition-colors duration-200 underline decoration-blue-300"
                    >
                      fptschoolhealthcare_swpproject@gmail.com
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-300">🌐</span>
                    <a 
                      href="https://fschool.fpt.edu.vn/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-200 hover:text-white transition-colors duration-200 underline decoration-blue-300"
                    >
                      daihoc.fpt.edu.vn
                    </a>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">🕘</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Giờ làm việc</h2>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="space-y-2 text-blue-100">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Thứ 2 - Thứ 6</span>
                      <span className="text-green-300 font-bold">7:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Thứ 7</span>
                      <span className="text-orange-300 font-bold">7:00 - 12:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Chủ nhật</span>
                      <span className="text-red-300">Nghỉ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health System Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">⚕️</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Y tế Học đường</h2>
                </div>
                
                <div className="space-y-3 text-blue-100">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-green-300">Dịch vụ 24/7</span>
                    </div>
                    <p className="text-sm">Theo dõi sức khỏe học sinh</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-orange-300">🏥</span>
                      <span className="font-semibold">Phòng Y tế</span>
                    </div>
                    <p className="text-sm">Tầng 1, Tòa nhà chính</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-100">
                      Hệ thống Quản lý Y tế Học đường
                    </span>
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-blue-200">
                  © {new Date().getFullYear()} Trường Tiểu học FPT. Tất cả quyền được bảo lưu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;