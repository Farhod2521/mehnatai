import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RobotAssistant from "@/components/RobotAssistant";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F0F2F5" }}>
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <Header />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
      <RobotAssistant />
    </div>
  );
}
