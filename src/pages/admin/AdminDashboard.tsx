import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { QuickStats } from "../../components/widgets/QuickStats";
import { ActivityFeed } from "../../components/widgets/ActivityFeed";
import { RecentList } from "../../components/widgets/RecentList";
import { BarChart } from "../../components/charts/BarChart";
import { QuickActions } from "../../components/widgets/QuickActions";

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const stats = [
    { title: "Views", value: 7265, trend: { value: 110, isPositive: true } },
    { title: "Visits", value: 3671, trend: { value: -0.8, isPositive: false } },
    { title: "New Users", value: 156, trend: { value: 16, isPositive: true } },
    { title: "Active Users", value: 2318, trend: { value: 6, isPositive: true } },
  ];

  const processData = [
    { label: "Linux", value: 25 },
    { label: "Mac", value: 28 },
    { label: "iOS", value: 21 },
    { label: "Windows", value: 17 },
    { label: "Android", value: 24 },
  ];

  const activities = [
    { id: 1, user: "Juan Pérez", action: "creó un nuevo proceso", target: "Operadores Mina", time: "Hace 10 min" },
    { id: 2, user: "María González", action: "actualizó empresa", target: "Minera Los Pelambres", time: "Hace 1 hora" },
    { id: 3, user: "Carlos Soto", action: "eliminó test", target: "Test Psicométrico V2", time: "Hace 2 horas" },
  ];

  const documents = [
    { name: "ByeWind", date: "Jun 24, 2025", amount: "$942.00", status: "In Progress" },
    { name: "Natali Craig", date: "Mar 10, 2025", amount: "$881.00", status: "Complete" },
    { name: "Drew Cano", date: "Nov 10, 2025", amount: "$409.00", status: "Pending" },
    { name: "Orlando Diggs", date: "Dec 20, 2025", amount: "$953.00", status: "Approved" },
    { name: "Andi Lane", date: "Jul 25, 2025", amount: "$907.00", status: "Rejected" },
  ];

  return (
  <div className="space-y-10 min-h-full pb-16">
    {/* Header */}
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido, {user?.firstName}</p>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-teal-400 outline-none"
        />
        <button className="p-2 rounded-lg bg-white shadow hover:shadow-md transition">
          🔔
        </button>
        <button className="p-2 rounded-lg bg-white shadow hover:shadow-md transition">
          ⚙️
        </button>
      </div>
    </header>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl p-6 shadow hover:shadow-lg transition-all"
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm text-gray-500">{stat.title}</h4>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {stat.value}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${
                stat.trend.isPositive ? "text-teal-600" : "text-red-500"
              }`}
            >
              {stat.trend.isPositive ? "+" : ""}
              {stat.trend.value}%
            </span>
          </div>
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Procesos vs Trabajadores */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Procesos vs Trabajadores</h2>
        <BarChart data={processData} title="" height={260} />
      </div>

      {/* Procesos Completados */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Procesos Completados</h2>
        <div className="flex justify-center items-center h-[260px]">
          <div className="w-48 h-48 rounded-full border-[14px] border-teal-400 relative">
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <span className="font-semibold text-gray-700">
                52% Completado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Documentos */}
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-6">Documentos</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left pb-3">Nombre</th>
            <th className="text-left pb-3">Archivo</th>
            <th className="text-left pb-3">Monto</th>
            <th className="text-left pb-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, i) => (
            <tr key={i} className="border-b last:border-none hover:bg-gray-50">
              <td className="py-3">{doc.name}</td>
              <td className="py-3">{doc.date}</td>
              <td className="py-3 font-semibold">{doc.amount}</td>
              <td className="py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    doc.status === "Complete"
                      ? "bg-teal-100 text-teal-700"
                      : doc.status === "Approved"
                      ? "bg-yellow-100 text-yellow-700"
                      : doc.status === "Pending"
                      ? "bg-blue-100 text-blue-700"
                      : doc.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {doc.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Activity Feed */}
    <div className="mt-10">
      <ActivityFeed activities={activities} maxItems={5} />
    </div>
  </div>
);

};
