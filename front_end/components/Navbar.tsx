// import React from "react";
// import { useAuth } from "../contexts/AuthContext";
// import { useRouter } from "next/router";

// type Props = {
//   title?: string;
// };

// export default function Navbar({ title }: Props) {
//   const { user, signOut } = useAuth();
//   const router = useRouter();

//   const handleSignOut = async () => {
//     await signOut();
//     router.push('/');
//   };

//   return (
//     <header className="navbar">
//       <div className="left">
//         <button className="hamburger" aria-label="Open Menu">☰</button>
//         <div className="title">{title || "Cocoinbox"}</div>
//       </div>
//       <div className="right">
//         {user && (
//           <>
//             <span className="user-email">{user.email}</span>
//             <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
//           </>
//         )}
//       </div>
//       <style jsx>{`
//         .navbar {
//           height: 64px;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 0 16px;
//           background: #fff;
//           border-bottom: 1px solid #e5e7eb;
//           position: sticky;
//           top: 0;
//           z-index: 40;
//         }
//         .left {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }
//         .title {
//           font-weight: 600;
//           font-size: 18px;
//         }
//         .right {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//         }
//         .user-email {
//           color: #64748b;
//           font-size: 14px;
//         }
//         .sign-out-btn {
//           background: #ef4444;
//           color: white;
//           border: none;
//           padding: 8px 16px;
//           border-radius: 6px;
//           font-size: 14px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: background 0.2s;
//         }
//         .sign-out-btn:hover {
//           background: #dc2626;
//         }
//         .hamburger {
//           display: none;
//           background: transparent;
//           border: none;
//           font-size: 24px;
//           cursor: pointer;
//         }
//         @media (max-width: 900px) {
//           .hamburger { display: inline-block; }
//           .user-email { display: none; }
//         }
//       `}</style>
//     </header>
//   );
// }




"use client"
import { Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Props = {
  title?: string
  onMenuClick: () => void
}

export default function Navbar({ title, onMenuClick }: Props) {
  // Mock user data - replace with your actual auth context
  const user = {
    email: "user@example.com",
    initials: "U",
  }

  const handleSignOut = async () => {
    // Replace with your actual sign out logic
    console.log("Sign out")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">{title || "Cocoinbox"}</h1>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              {/* Desktop user info */}
              <span className="hidden md:inline-block text-sm text-muted-foreground mr-2">{user.email}</span>

              {/* User dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground">{user.initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">My Account</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
