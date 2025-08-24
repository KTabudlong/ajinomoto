import { usePage, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  MapPin,
  Activity,
} from "lucide-react";
import { useMemo } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MinimalistChart = ({ data, color = "#6366f1" }) => {
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
          fill={color}
          rx={3}
        />
      ))}
      {data.map((d, i) => (
        <text
          key={d.month + "label"}
          x={i * 26 + 18}
          y={98}
          fontSize={12}
          textAnchor="middle"
          fill="#000"
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
};

function DashboardPage() {
  const { auth, tutors = [], selectedTutorId, selectedTutor } = usePage().props;
  const isSuperAdmin = auth?.user?.role_id === 1;
  const isTutor = auth?.user?.role_id === 2;

  // Use selectedTutorId for mock data seed
  const seed = selectedTutorId ? parseInt(selectedTutorId, 10) : 0;
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
  function seededInt(seed, min, max) {
    return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
  }
  // Generate mock data based on selected tutor
  const dashboard = useMemo(() => {
    return {
      totalActivities: seededInt(seed, 50, 200),
      upcomingActivities: seededInt(seed + 1, 5, 20),
      completedActivities: seededInt(seed + 2, 30, 100),
      totalSites: seededInt(seed + 3, 5, 20),
      activitiesData: Array.from({ length: 12 }, (_, i) => ({
        month: months[i],
        value: seededInt(seed + i, 5, 20),
      })),
      sitesData: Array.from({ length: 12 }, (_, i) => ({
        month: months[i],
        value: seededInt(seed + i + 20, 1, 5),
      })),
      recentActivities: Array.from({ length: 5 }, (_, i) => ({
        title: `Activity ${seededInt(seed + i + 40, 1, 10)}`,
        site: `Site ${seededInt(seed + i + 50, 1, 20)}`,
        date: `${months[seededInt(seed + i + 60, 0, 11)]} ${seededInt(seed + i + 70, 1, 28)}, 2024`,
        status: ["active", "completed", "paused"][
          seededInt(seed + i + 80, 0, 2)
        ],
      })),
    };
  }, [seed]);

  // Tutor dropdown for super admin
  function handleTutorChange(e) {
    const tutorId = e.target.value;
            router.get(route("admin.dashboard"), { tutor_id: tutorId });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        {isSuperAdmin && tutors.length > 0 && (
          <div className="flex items-center space-x-2">
            <label
              htmlFor="tutor-select"
              className="text-sm text-gray-600 font-medium"
            >
              Tutor:
            </label>
            <select
              id="tutor-select"
              className="border rounded px-2 py-1 text-sm max-w-[340px]"
              value={selectedTutorId || ""}
              onChange={handleTutorChange}
            >
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.first_name} {tutor.last_name} ({tutor.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <BookOpen size={32} className="text-indigo-600 mb-2" />
          <div className="text-2xl font-bold">{dashboard.totalActivities}</div>
          <div className="text-gray-600 mt-1">Total Activities</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <Calendar size={32} className="text-blue-600 mb-2" />
          <div className="text-2xl font-bold">{dashboard.upcomingActivities}</div>
          <div className="text-gray-600 mt-1">Upcoming</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <CheckCircle size={32} className="text-green-600 mb-2" />
          <div className="text-2xl font-bold">
            {dashboard.completedActivities}
          </div>
          <div className="text-gray-600 mt-1">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <MapPin size={32} className="text-yellow-600 mb-2" />
          <div className="text-2xl font-bold">{dashboard.totalSites}</div>
          <div className="text-gray-600 mt-1">Total Sites</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BookOpen size={24} className="text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Activities (Last 12 Months)
            </h2>
          </div>
          <MinimalistChart data={dashboard.activitiesData} color="#6366f1" />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MapPin size={24} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sites Overview
            </h2>
          </div>
          <MinimalistChart data={dashboard.sitesData} color="#3b82f6" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Activity size={24} className="text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {dashboard.recentActivities && dashboard.recentActivities.length > 0 ? (
            dashboard.recentActivities.map((activity, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <span className="text-gray-700 text-sm">
                  {activity.title} at {activity.site} - {activity.date}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    activity.status === "completed"
                      ? "text-green-600"
                      : activity.status === "active"
                        ? "text-blue-600"
                        : "text-red-600"
                  }`}
                >
                  {activity.status.charAt(0).toUpperCase() +
                    activity.status.slice(1)}
                </span>
              </li>
            ))
          ) : (
            <li className="py-2 text-gray-400 text-sm">No recent activities.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

DashboardPage.layout = (page) => (
  <MainLayout title="Dashboard" children={page} />
);

export default DashboardPage;
