import Link from "next/link";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

function Footer({
  menuItems = [
    {
      title: "Browse",
      links: [
        { text: "Categories", url: "/products" },
        { text: "Featured", url: "/featured" },
        { text: "New Releases", url: "/products?sort=newest" },
        { text: "Best Sellers", url: "/products?sort=popular" },
      ],
    },
    {
      title: "Account",
      links: [
        { text: "Dashboard", url: "/user/dashboard" },
        { text: "My Products", url: "/user/dashboard/my-products" },
        { text: "Favorites", url: "/user/dashboard/favorites" },
        { text: "Recently Viewed", url: "/user/dashboard/recently-viewed" },
      ],
    },
    {
      title: "Sell",
      links: [
        { text: "Become a Seller", url: "/user/dashboard/settings" },
        { text: "Create Listing", url: "/product/create" },
        { text: "Seller Guidelines", url: "/seller-guidelines" },
        { text: "Analytics", url: "/user/dashboard/analytics" },
      ],
    },
    {
      title: "Help",
      links: [
        { text: "FAQ", url: "/faq" },
        { text: "Contact Us", url: "/contact" },
        { text: "About Us", url: "/about" },
        { text: "Support", url: "/support" },
      ],
    },
  ],
  copyright = "© 2025 bookify.com. All rights reserved.",
  bottomLinks = [
    { text: "Terms of Service", url: "/terms" },
    { text: "Privacy Policy", url: "/privacy" },
    { text: "Cookie Policy", url: "/cookies" },
    { text: "Accessibility", url: "/accessibility" },
  ],
}: FooterProps) {
  return (
    <section className="pt-16 pb-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <footer className="text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx} className="text-center">
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-3 text-muted-foreground">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary"
                    >
                      <Link href={link.url}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">{copyright}</p>
              <ul className="flex gap-4 flex-wrap justify-center">
                {bottomLinks.map((link, linkIdx) => (
                  <li key={linkIdx} className="underline text-sm font-medium hover:text-primary">
                    <Link href={link.url}>{link.text}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default Footer;
