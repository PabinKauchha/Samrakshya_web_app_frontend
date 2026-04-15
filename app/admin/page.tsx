"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

import {
  Shield,
  Users,
  AlertTriangle,
  Activity,
  RefreshCw,
  MapPin,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ✅ load map WITHOUT SSR
const LeafletMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

// ================= TYPES =================
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type Stats = {
  totalUsers: number;
  totalSOS: number;
  activeSOS: number;
  totalIncidents: number;
};

type SOS = {
  _id: string;
  latitude: number;
  longitude: number;
  status: string;
  user?: {
    name: string;
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sosList, setSosList] = useState<SOS[]>([]);

  // ================= LOAD STATS =================
  const loadStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get<ApiResponse<Stats>>(
        "http://localhost:4321/api/admin/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStats(res.data.data);
    } catch (err: any) {
      console.error("Stats error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  // ================= LOAD SOS =================
  const loadSOS = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get<ApiResponse<SOS[]>>(
        "http://localhost:4321/api/admin/active-sos",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSosList(res.data.data);
    } catch (err: any) {
      console.error("SOS error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  // ================= AUTH + INIT =================
  useEffect(() => {
    const checkAdminAndLoad = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        // 🔥 VERIFY ROLE FROM BACKEND (REAL FIX)
        const res = await axios.get<
  ApiResponse<{
    user: {
      role: string;
    };
  }>
>(
  "http://localhost:4321/api/auth/me",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

        const role = res.data.data.user.role;

        console.log("ROLE:", role); // debug

        if (role !== "admin") {
          window.location.href = "/dashboard";
          return;
        }

        // ✅ ONLY LOAD IF ADMIN
        loadStats();
        loadSOS();

        const interval = setInterval(() => {
          loadStats();
          loadSOS();
        }, 10000);

        return () => clearInterval(interval);

      } catch (err) {
        console.error("Auth check failed:", err);
        window.location.href = "/login";
      }
    };

    checkAdminAndLoad();
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* ===== HEADER ===== */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Shield className="text-white w-4 h-4" />
            </div>
            <span className="font-bold">Admin Panel</span>
          </div>

          <Button size="sm" variant="outline" onClick={loadSOS}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users />} label="Users" value={stats?.totalUsers ?? 0} />
          <StatCard icon={<Activity />} label="Total SOS" value={stats?.totalSOS ?? 0} />
          <StatCard icon={<AlertTriangle />} label="Active SOS" value={stats?.activeSOS ?? 0} danger />
          <StatCard icon={<MapPin />} label="Incidents" value={stats?.totalIncidents ?? 0} />
        </div>

        {/* ===== MAP ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Live SOS Map</CardTitle>
            <CardDescription>Real-time tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <LeafletMap sosList={sosList} />
          </CardContent>
        </Card>

        {/* ===== LIST ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Active SOS</CardTitle>
          </CardHeader>
          <CardContent>
            {sosList.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active SOS</p>
            ) : (
              <ul className="space-y-2">
                {sosList.map((sos) => (
                  <li
                    key={sos._id}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {sos.user?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sos.latitude}, {sos.longitude}
                      </p>
                    </div>

                    <Badge variant="destructive">{sos.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

// ================= STAT CARD =================
function StatCard({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${danger ? "bg-red-100 text-red-600" : "bg-muted"}`}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}