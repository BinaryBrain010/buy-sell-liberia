import { LogoMain } from "@/lib/media";

interface ProductThumbnailProps {
  product: any;
  size?: "sm" | "md" | "lg";
  forceLogo?: boolean;
}

export const ProductThumbnail = ({
  product,
  size = "md",
  forceLogo = false,
}: ProductThumbnailProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const getProductTitle = () => {
    if (product && typeof product === "object" && product.title) {
      return product.title;
    }
    return "Unknown Product";
  };

  const renderLogo = () => (
    <img
      src={typeof LogoMain === "string" ? LogoMain : "/logo.svg"}
      alt="BuySell Liberia"
      className="w-full h-full object-contain bg-white p-1"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
      }}
    />
  );

  const renderProductImage = () => {
    if (
      product &&
      typeof product === "object" &&
      product.images &&
      product.images.length > 0
    ) {
      const raw = product.images[0];
      const resolve = (img: any) => {
        if (!img) return undefined;
        const v =
          typeof img === "string" ? img : img.url || img.path || img.src;
        if (!v) return undefined;
        if (/^https?:\/\//i.test(v) || v.startsWith("/api/uploads")) return v;
        const clean = v.replace(/^\/+/, "");
        return `/api/uploads/${clean}`;
      };
      const src = resolve(raw) || "/placeholder.svg";
      return (
        <img
          src={src}
          alt={getProductTitle()}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      );
    }
    return null;
  };

  return (
    <div
      className={`flex-shrink-0 ${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-100 border`}
    >
      {forceLogo ? renderLogo() : renderProductImage() || renderLogo()}
    </div>
  );
};
