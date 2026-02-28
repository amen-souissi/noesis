import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 px-6 pb-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
