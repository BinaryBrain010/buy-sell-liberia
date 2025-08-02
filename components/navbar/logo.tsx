import Link from "next/link"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center card-shadow">
        <span className="text-white font-bold text-sm">BS</span>
      </div>
      <span className="font-bold text-xl">BuySell</span>
    </Link>
  )
}
