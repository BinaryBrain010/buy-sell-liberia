import { MessageCircle } from "lucide-react"

export const LoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="h-8 w-8 text-blue-500" />
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
      <p className="text-gray-600">Loading messages...</p>
    </div>
  )
}
