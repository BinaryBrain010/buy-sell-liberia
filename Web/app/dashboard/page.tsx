"use client"

import { useState } from "react"
import DashboardSidebar from "@/components/dashboard/sidebar"
import DashboardLayout from "@/components/dashboard/layout"

export default function DashboardPage() {
  const [section, setSection] = useState("account")

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar currentSection={section} onChange={setSection} />
      <DashboardLayout section={section} />
    </div>
  )
}
