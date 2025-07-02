// src/components/layout/Header.tsx
import logo from '@/assets/logo.png';
import UserDropdownMenu from './UserDropdownMenu';

const Header = () => {
  return (
    <header className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-lg relative z-30">
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo + Title */}
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-all duration-300"></div>
                <div className="relative bg-white rounded-2xl p-3 shadow-xl ring-1 ring-blue-500/10 group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                  <img 
                    src={logo} 
                    alt="Logo FPT" 
                    className="w-12 h-12 object-contain" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                  Hệ thống Quản lý Y tế Học đường
                </h1>
                <p className="text-gray-600 font-medium flex items-center">
                  <span className="inline-block w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-2 animate-pulse"></span>
                  Trường Tiểu học FPT
                </p>
              </div>
            </div>

            {/* Status + Avatar */}
            <div className="flex items-center space-x-6 relative z-50">
              {/* System Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 px-4 py-2 rounded-xl hidden md:flex items-center space-x-3 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-20"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">Hệ thống hoạt động</span>
              </div>

              {/* Enhanced Avatar Wrapper */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative bg-white rounded-2xl p-1 shadow-xl ring-2 ring-blue-500/10 group-hover:ring-blue-500/20 group-hover:shadow-2xl transition-all duration-300">
                  <UserDropdownMenu />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 shadow-sm"></div>
    </header>
  );
};

export default Header;