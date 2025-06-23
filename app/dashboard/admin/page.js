'use client';
import { useState, useEffect } from 'react';
import {
  Users,
  Building,
  CheckSquare,
  Activity,
  Award
} from 'lucide-react';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';
import Footer from '@/app/components/Dashboard/Footer';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ukmList, setUkmList] = useState([]);

  // State for stats
  const [stats, setStats] = useState([
    { title: 'Total UKM', value: '-', icon: Building, color: 'from-blue-400 to-blue-200' },
    { title: 'Total Mahasiswa', value: '-', icon: Users, color: 'from-green-400 to-green-200' },
    { title: 'Pendaftaran Baru', value: '-', icon: CheckSquare, color: 'from-yellow-400 to-yellow-200' },
    { title: 'UKM Paling Aktif', value: '-', icon: Activity, color: 'from-purple-400 to-purple-200' },
  ]);

  // State for additional details
  const [recentRegistration, setRecentRegistration] = useState({ pending: 0, approved: 0, rejected: 0 });

  // State for Top 3 UKM Teraktif
  const [topUKM, setTopUKM] = useState([]);

  useEffect(() => {
    // Get UKM data
    fetch('/api/dashadmin/ukm')
      .then(res => res.json())
      .then(data => {
        setStats(prev => prev.map(stat => {
          if (stat.title === 'Total UKM') return { ...stat, value: data.total ?? '-' };
          return stat;
        }));
        setUkmList(data.list ?? []);
      });

    fetch('/api/dashadmin/users')
      .then(res => {
        if (!res.ok) throw new Error('Gagal mengambil data mahasiswa');
        return res.json();
      })
      .then(data => {
        setStats(prev =>
          prev.map(stat =>
            stat.title === 'Total Mahasiswa'
              ? { ...stat, value: data?.total ?? '-' }
              : stat
          )
        );
      })
      .catch(() => {
        setStats(prev =>
          prev.map(stat =>
            stat.title === 'Total Mahasiswa'
              ? { ...stat, value: '-' }
              : stat
          )
        );
      });

    fetch('/api/dashadmin/kegiatan')
      .then(res => res.json())
      .then(data => {
        setTopUKM(data.topUKM ?? []);
        setStats(prev => prev.map(stat =>
          stat.title === 'UKM Paling Aktif'
            ? { ...stat, value: data.topUKM && data.topUKM.length > 0 ? `${data.topUKM[0].ukm} (${data.topUKM[0].totalKegiatan} kegiatan)` : '-' }
            : stat
        ));
      });

    fetch('/api/dashadmin/pendaftar')
      .then(res => res.json())
      .then(data => {
        setStats(prev => prev.map(stat =>
          stat.title === 'Pendaftaran Baru'
            ? { ...stat, value: data.pending ?? '-' }
            : stat
        ));
        setRecentRegistration({
          pending: data.pending ?? 0,
          approved: data.approved ?? 0,
          rejected: data.rejected ?? 0
        });
      })
      .catch(() => {
        setStats(prev => prev.map(stat =>
          stat.title === 'Pendaftaran Baru'
            ? { ...stat, value: '-' }
            : stat
        ));
        setRecentRegistration({ pending: 0, approved: 0, rejected: 0 });
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} userRole="admin" />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userData={{ role: 'admin', nama: 'Admin' }}
        />

        <main className="p-6 md:p-10 mt-14">
          <h1 className="text-3xl font-extrabold text-gray-700 mb-8 drop-shadow">
            Admin Dashboard UKM
          </h1>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-3xl bg-white shadow-xl p-6 flex flex-col items-center gap-3 border-2 border-gray-200 hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gray-300 shadow-lg mb-2">
                  <stat.icon className="w-8 h-8 text-gray-700" strokeWidth={2.4} />
                </div>
                <div className="text-base text-gray-600 font-semibold text-center">{stat.title}</div>
                <div className="text-4xl font-black text-gray-700 tracking-tight text-center">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-4 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Activity className="w-6 h-6 text-gray-500" />
                Statistik Pendaftaran
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-yellow-400 pl-4 py-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span className="text-gray-600 text-sm">Pendaftar Baru (pending):</span>
                  <span className="font-bold text-gray-700">{recentRegistration.pending}</span>
                </div>
                <div className="flex items-center gap-2 border-l-4 border-green-500 pl-4 py-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-gray-600 text-sm">Pendaftar Diterima (approved):</span>
                  <span className="font-bold text-gray-700">{recentRegistration.approved}</span>
                </div>
                <div className="flex items-center gap-2 border-l-4 border-red-500 pl-4 py-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-gray-600 text-sm">Pendaftar Ditolak (rejected):</span>
                  <span className="font-bold text-gray-700">{recentRegistration.rejected}</span>
                </div>
              </div>
            </div>

            {/* Top 3 UKM Teraktif */}
            <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-4 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2 mb-2">
                <Award className="w-6 h-6 text-gray-500" />
                Top 3 UKM Teraktif
              </h2>
              <div className="space-y-4">
                {topUKM.length === 0 && (
                  <div className="text-gray-500">Belum ada data kegiatan UKM.</div>
                )}
                {topUKM.map((item, idx) => (
                  <div
                    key={item.ukm}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${idx === 0
                      ? 'border-gray-500 bg-gray-100'
                      : 'border-gray-200 bg-gray-50'
                      }`}
                  >
                    <span className={`text-lg font-bold ${idx === 0 ? 'text-gray-700' : 'text-gray-600'}`}>
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.ukm}</p>
                      <p className="text-sm text-gray-500">{item.totalKegiatan} kegiatan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* List Semua UKM & Jumlah Member */}
            <div className="col-span-1 xl:col-span-2 bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-200 mt-8">
              <h2 className="text-xl font-bold text-gray-700 mb-2">Daftar UKM & Jumlah Anggota</h2>
              <p className="mb-4 text-gray-500 text-sm">
                Berikut adalah daftar lengkap Unit Kegiatan Mahasiswa (UKM) beserta total anggota yang sudah bergabung dan terverifikasi.
              </p>
              <div className="w-full overflow-x-auto">
                <table className="w-full table-auto divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-2/3">Nama UKM</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 w-1/3">Total Anggota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ukmList.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-4 px-4 text-center text-gray-500">Belum ada data UKM terdaftar.</td>
                      </tr>
                    ) : (
                      ukmList.map((item, idx) => (
                        <tr key={item._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                          <td className="py-3 px-4 font-medium text-gray-900">{item.name || item.nama || '-'}</td>
                          <td className="py-3 px-4 text-gray-700">{item.totalMembers}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer className="mt-auto" />
      </div>
    </div>
  );
}