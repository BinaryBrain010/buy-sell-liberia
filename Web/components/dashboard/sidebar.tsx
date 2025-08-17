import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentSection: string
  onChange: (section: string) => void
}

const sections = [
  { key: "account", label: "Account Info" },
  { key: "edit", label: "Edit Profile" },
  { key: "listings", label: "My Listings" },
  { key: "favourites", label: "Favourites" },
  { key: "chats", label: "Messages" },
]

export default function DashboardSidebar({ currentSection, onChange }: SidebarProps) {
  return (
    <aside className="w-64 p-4 bg-white border-r shadow-md">
      <nav className="space-y-2">
        {sections.map((section) => (
          <Button
            key={section.key}
            variant={currentSection === section.key ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onChange(section.key)}
          >
            {section.label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
