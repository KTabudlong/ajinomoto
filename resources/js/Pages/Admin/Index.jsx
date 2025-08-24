import MainLayout from "@/Layouts/MainLayout";
import { Link } from "@inertiajs/react";
import { Users, BookOpen, DollarSign, Activity, Settings, Calendar, MapPin } from "lucide-react";
import { useMemo } from "react";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const mockRevenueData = Array.from({ length: 12 }, (_, i) => ({
  month: months[i],
  value: getRandomInt(1000, 5000),
}));

const mockDashboard = {
  totalActivities: getRandomInt(100, 500),
  totalSites: getRandomInt(5, 20),
  activeUsers: getRandomInt(10, 50),
  activeTopics: getRandomInt(20, 100),
  recentActivity: Array.from({ length: 6 }, (_, i) => ({
    message: `Activity #${getRandomInt(1000, 9999)} was created`,
    time: `${getRandomInt(1, 12)} hours ago`,
  })),
  revenueData: mockRevenueData,
};

const adminPanelItems = [
  {
    label: "Settings",
    href: route("admin.super.settings.index"),
    icon: <Settings size={32} className="text-indigo-600" />,
  },
  {
    label: "Topics",
    href: route("admin.topics.index"),
    icon: <BookOpen size={32} className="text-indigo-600" />,
  },
  {
    label: "Sites",
    href: route("admin.sites.index"),
    icon: <MapPin size={32} className="text-blue-600" />,
  },
  {
    label: "Activities",
    href: route("admin.activities.index"),
    icon: <Calendar size={32} className="text-green-600" />,
  },
];

const RevenueChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <svg viewBox="0 0 320 100" className="w-full h-24">
      {data.map((d, i) => (
        <rect
          key={d.month}
          x={i * 26 + 10}
          y={100 - (d.value / max) * 90}
          width={16}
          height={(d.value / max) * 90}
          fill="#6366f1"
          rx={3}
        />
      ))}
      {data.map((d, i) => (
        <text
          key={d.month + "label"}
          x={i * 26 + 18}
          y={98}
          fontSize={10}
          textAnchor="middle"
          fill="#888"
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
};

const AdminIndex = () => {
  const dashboard = useMemo(() => mockDashboard, []);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Charts & Stats (9/12) */}
        <div className="lg:col-span-9 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <BookOpen size={32} className="text-indigo-600 mb-2" />
              <div className="text-2xl font-bold">{dashboard.totalActivities}</div>
              <div className="text-gray-600 mt-1">Total Activities</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <MapPin size={32} className="text-green-600 mb-2" />
              <div className="text-2xl font-bold">{dashboard.totalSites}</div>
              <div className="text-gray-600 mt-1">Total Sites</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <Users size={32} className="text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{dashboard.activeUsers}</div>
              <div className="text-gray-600 mt-1">Active Users</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <BookOpen size={32} className="text-yellow-600 mb-2" />
              <div className="text-2xl font-bold">{dashboard.activeTopics}</div>
              <div className="text-gray-600 mt-1">Active Topics</div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Activity size={24} className="text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Activity Volume (Last 12 Months)
              </h2>
            </div>
            <RevenueChart data={dashboard.revenueData} />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Activity size={24} className="text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {dashboard.recentActivity && dashboard.recentActivity.length > 0 ? (
                dashboard.recentActivity.map((activity, idx) => (
                  <li key={idx} className="py-2 flex items-center justify-between">
                    <span className="text-gray-700 text-sm">
                      {activity.message}
                    </span>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </li>
                ))
              ) : (
                <li className="py-2 text-gray-400 text-sm">No recent activity.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column - Admin Panel (3/12) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Admin Panel</h2>
            <div className="space-y-4">
              {adminPanelItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition group border border-gray-200 hover:border-indigo-400"
                >
                  <div className="mr-4">
                    {item.icon}
                  </div>
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-indigo-700">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminIndex.layout = (page) => (
  <MainLayout title="Admin Dashboard">{page}</MainLayout>
);

export default AdminIndex;
