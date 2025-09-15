
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function fetchPage(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.exists ? data : null;
  } catch {
    return null;
  }
}

type HelpData = { blocks?: Array<{ icon?: string; title: string; text: string }> };

export default async function HelpPage() {
  const data = await fetchPage("help");
  const blocks: HelpData["blocks"] = data?.data?.blocks;
  if (data && !blocks) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10 prose prose-zinc dark:prose-invert">
        <h1>{data.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </main>
    )
  }
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <Card className="w-full max-w-md mx-auto glass border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Help Center</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Under Construction</h3>
              <p className="text-muted-foreground">Help center is being developed. Coming soon!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
