import React from "react";
import type { Metadata } from "next";
import { getAllAdminData } from "@/lib/mock-fallback";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Command Center Admin | KRONOS.GG",
  description:
    "Panel Administrasi & Manajemen Katalog Game, Produk SKU, Metode Pembayaran, dan Transaksi KRONOS.GG",
};

export default async function AdminPage() {
  const initialData = await getAllAdminData();

  return <AdminDashboardClient initialData={initialData} />;
}
