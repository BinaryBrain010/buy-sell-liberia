interface ProductThumbnailProps {
  product: any
  size?: "sm" | "md" | "lg"
}

export const ProductThumbnail = ({ product, size = "md" }: ProductThumbnailProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const getProductTitle = () => {
    if (product && typeof product === "object" && product.title) {
      return product.title
    }
    return "Unknown Product"
  }

  return (
    <div className={`flex-shrink-0 ${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-100 border`}>
      {product && typeof product === "object" && product.images && product.images.length > 0 ? (
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={getProductTitle()}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs">📦</span>
          </div>
        </div>
      )}
    </div>
  )
}
