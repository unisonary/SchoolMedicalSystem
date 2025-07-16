// src/layouts/PublicLayout.tsx
import HeaderHome from "@/components/home/HeaderHome";
import Footer from "@/components/layout/Footer";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderHome />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
