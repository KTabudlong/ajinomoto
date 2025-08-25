import MainMenuItem from "@/Components/Menu/MainMenuItem";
import { usePage } from "@inertiajs/react";
import {
  CircleGauge,
  BookOpenText,
  Users,
  CalendarDays,
  Settings,
} from "lucide-react";

export default function MainMenu({ className }) {
  const { auth } = usePage().props;
  const user = auth.user;

  const mainMenuItems = [
    // Show Admin Panel for super admin only (at the top)
    ...(user.role_id === 1
      ? [
          {
            text: "Admin Panel",
            link: "admin.super.dashboard",
            icon: <Settings size={20} />,
          },
        ]
      : []),
    {
      text: "Dashboard",
      link: "admin.dashboard",
      icon: <CircleGauge size={20} />,
    },
    {
      text: "Schedules",
      link: "admin.schedules",
      icon: <CalendarDays size={20} />,
    },
        {
      text: "Users",
      link: "admin.users",
      icon: <Users size={20} />,
    },
            {
      text: "Topics",
      link: "admin.topics",
      icon: <BookOpenText size={20} />,
    },
    {
      text: "Sites",
      link: "admin.sites",
      icon: <CalendarDays size={20} />,
    },
    {
      text: "Activities",
      link: "admin.activities",
      icon: <CalendarDays size={20} />,
    },
  ];

  return (
    <div className={className}>
      {mainMenuItems.map((item, index) => (
        <MainMenuItem key={index} {...item} />
      ))}
    </div>
  );
}
