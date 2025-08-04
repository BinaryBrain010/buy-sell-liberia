import Link from "next/link"

export default function NavigationLinks() {
  const links = ["categories", "products", "about", "contact", "help"]
  return (
    <>
      <div className="hidden lg:flex items-center space-x-6">
              <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                Help
              </Link>
      </div>
    </>
  )
}
