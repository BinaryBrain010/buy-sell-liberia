interface UserStatusProps {
  isOnline: boolean
  size?: "sm" | "md"
}

export const UserStatus = ({ isOnline, size = "md" }: UserStatusProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
  }

  return (
    <span
      title={isOnline ? "Online" : "Offline"}
      className={`inline-block rounded-full transition-colors ${sizeClasses[size]} ${
        isOnline ? "bg-green-500" : "bg-gray-400"
      }`}
    />
  )
}
