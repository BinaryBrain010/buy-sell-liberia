import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <Card className="w-full max-w-md mx-auto glass border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cookie Policy</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍪</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Under Construction</h3>
              <p className="text-muted-foreground">Cookie policy page is being developed. Coming soon!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
