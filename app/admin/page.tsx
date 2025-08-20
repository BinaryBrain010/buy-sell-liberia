import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Under Construction</h3>
            <p className="text-muted-foreground">
              The admin panel is currently being developed. Please check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
