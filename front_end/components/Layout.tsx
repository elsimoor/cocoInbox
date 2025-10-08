// import React from "react";
// import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";

// type Props = {
//   children: React.ReactNode;
//   title?: string;
// };

// export default function Layout({ children, title }: Props) {
//   return (
//     <div className="app-root">
//       <Navbar title={title || "Cocoinbox"} />
//       <div className="main">
//         <Sidebar />
//         <main className="content">{children}</main>
//       </div>
//       <style jsx>{`
//         .app-root {
//           min-height: 100vh;
//           display: flex;
//           flex-direction: column;
//         }
//         .main {
//           display: flex;
//           flex: 1;
//         }
//         .content {
//           flex: 1;
//           padding: 24px;
//           min-height: calc(100vh - 64px);
//           background: #f6f8fa;
//         }
//       `}</style>
//     </div>
//   );
// }




// test1


"use client"

import type React from "react"
import { useState } from "react"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"


type Props = {
  children: React.ReactNode
  title?: string
}

export default function AppLayout({ children, title }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar title={title || "Cocoinbox"} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
