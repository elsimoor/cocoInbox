// import React from "react";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import { useAuth } from "../contexts/AuthContext";

// export default function Sidebar() {
//   const router = useRouter();
//   const { user } = useAuth();

//   const isActive = (path: string) => router.pathname === path;

//   return (
//     <aside className="sidebar">
//       <div className="brand">Cocoinbox</div>
//       <nav>
//         <ul>
//           <li className={isActive('/dashboard') ? 'active' : ''}>
//             <Link href="/dashboard">
//               <span className="icon">📊</span>
//               Dashboard
//             </Link>
//           </li>
//           <li className={isActive('/emails') ? 'active' : ''}>
//             <Link href="/emails">
//               <span className="icon">📧</span>
//               Ephemeral Emails
//             </Link>
//           </li>
//           {/* Inbox page: allow users to view messages received on their temporary addresses. */}
//           <li className={isActive('/inbox') ? 'active' : ''}>
//             <Link href="/inbox">
//               <span className="icon">📨</span>
//               Inbox
//             </Link>
//           </li>
//           <li className={isActive('/notes') ? 'active' : ''}>
//             <Link href="/notes">
//               <span className="icon">📝</span>
//               Secure Notes
//             </Link>
//           </li>
//           <li className={isActive('/files') ? 'active' : ''}>
//             <Link href="/files">
//               <span className="icon">📁</span>
//               Secure Files
//             </Link>
//           </li>

//           {/* Show admin links only for admin users */}
//           {user?.roles?.includes('admin') && (
//             <>
//               <li className="admin-divider">
//                 <span>Admin Panel</span>
//               </li>
//               <li className={isActive('/admin') ? 'active' : ''}>
//                 <Link href="/admin">
//                   <span className="icon">📊</span>
//                   Dashboard
//                 </Link>
//               </li>
//               <li className={isActive('/users') ? 'active' : ''}>
//                 <Link href="/users">
//                   <span className="icon">👥</span>
//                   Users
//                 </Link>
//               </li>
//               <li className={isActive('/domains') ? 'active' : ''}>
//                 <Link href="/domains">
//                   <span className="icon">⚙️</span>
//                   Domains
//                 </Link>
//               </li>
//             </>
//           )}
//         </ul>
//       </nav>
//       <style jsx>{`
//         .sidebar {
//           width: 260px;
//           background: #1e293b;
//           color: white;
//           padding: 20px;
//           min-height: calc(100vh - 64px);
//         }
//         .brand {
//           font-weight: bold;
//           font-size: 20px;
//           margin-bottom: 32px;
//           color: #f1f5f9;
//         }
//         nav ul {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//         }
//         nav li {
//           margin: 4px 0;
//           border-radius: 8px;
//           transition: background 0.2s;
//         }
//         nav li.active {
//           background: #334155;
//         }
//         nav li:hover {
//           background: #334155;
//         }
//         nav a {
//           color: #cbd5e1;
//           text-decoration: none;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           padding: 12px 16px;
//           font-weight: 500;
//           transition: color 0.2s;
//         }
//         nav li.active a {
//           color: #f1f5f9;
//         }
//         nav li:hover a {
//           color: #f1f5f9;
//         }
//         .icon {
//           font-size: 18px;
//         }
//         .admin-divider {
//           margin-top: 24px;
//           padding: 8px 16px;
//           font-size: 12px;
//           font-weight: 600;
//           color: #94a3b8;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           pointer-events: none;
//         }
//         .admin-divider:hover {
//           background: transparent;
//         }
//         @media (max-width: 900px) {
//           .sidebar { display: none; }
//         }
//       `}</style>
//     </aside>
//   );
// }



// test1



"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Mail, Inbox, FileText, FolderOpen, Users, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ephemeral Emails", href: "/emails", icon: Mail },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Secure Notes", href: "/notes", icon: FileText },
  { name: "Secure Files", href: "/files", icon: FolderOpen },
]

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Domains", href: "/domains", icon: Settings },
]

export default function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()
  //   const router = useRouter();
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes("admin")



  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-sidebar">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              C
            </div>
            <span className="text-lg">Cocoinbox</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {isAdmin && (
            <div className="mt-8">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  Admin Panel
                </h3>
              </div>
              <nav className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              C
            </div>
            <span className="text-lg">Cocoinbox</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-sidebar-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {isAdmin && (
            <div className="mt-8">
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  Admin Panel
                </h3>
              </div>
              <nav className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  )
}
