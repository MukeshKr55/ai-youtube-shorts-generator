"use client";

import { CircleUser, FileVideo, PanelsTopLeft, ShieldPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function Sidebar() {
  const MenuOpt = [
    {
      id: 1,
      name: "Dashboard",
      path: "/dashboard",
      icon: PanelsTopLeft,
    },
    {
      id: 2,
      name: "Create New",
      path: "/dashboard/create-new",
      icon: FileVideo,
    },
    {
      id: 3,
      name: "Upgrade",
      path: "/upgrade",
      icon: ShieldPlus,
    },
    {
      id: 4,
      name: "Account",
      path: "/account",
      icon: CircleUser,
    },
  ];

  const path = usePathname();

  return (
    <div className="w-64 h-screen shadow-md p-5 bg-purple-50">
      <div className="grid gap-2">
        {MenuOpt.map((item, idx) => (
          <Link key={idx} href={item.path}>
            <div
              className={`flex gap-3 items-center p-3 hover:bg-primary hover:text-white rounded-md cursor-pointer ${
                path == item.path && "bg-primary text-white"
              }`}
            >
              <item.icon />
              <h2 className="">{item.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
