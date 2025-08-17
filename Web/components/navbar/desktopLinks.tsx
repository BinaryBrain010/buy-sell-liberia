import Link from "next/link"

export default function DesktopLinks() {
  const links = ["categories", "products", "about", "contact", "help"]
  return (
    <>
      {links.map(link => (
        <Link key={link} href={`/${link}`} className="text-muted-foreground hover:text-primary transition-colors capitalize">
          {link}
        </Link>
      ))}
    </>
  )
}
