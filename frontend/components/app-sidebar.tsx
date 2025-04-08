"use client"

import * as React from "react"
import { ChevronRight, Home, ShoppingCart, Wallet, BookOpen, BarChart3, Settings, Heart, Clock } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/authprovider"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  
  if (!user) {
    router.push('/login')
    return null
  }

  const dashboardNav = [
    {
      title: "Overview",
      icon: <Home className="h-4 w-4 mr-2" />,
      url: "/user/dashboard",
      items: []
    },
    {
      title: "Products",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
      url: "#",
      items: [
        {
          title: "My Products",
          url: '/user/dashboard/my-products',
        },
        {
          title: "Create New Listing",
          url: "/product/create",
        },
      ],
    },
    {
      title: "Orders",
      icon: <ShoppingCart className="h-4 w-4 mr-2" />,
      url: "#",
      items: [
        {
          title: "Purchased",
          url: "/user/dashboard/purchased",
        },
        {
          title: "Sold",
          url: "/user/dashboard/sold-orders",
        },
      ],
    },
    {
      title: "Finances",
      icon: <Wallet className="h-4 w-4 mr-2" />,
      url: "#",
      items: [
        {
          title: "Wallet",
          url: "/user/dashboard/wallet",
        },
      ],
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-4 w-4 mr-2" />,
      url: "/user/dashboard/analytics",
      items: []
    },
    {
      title: "Saved Items",
      icon: <Heart className="h-4 w-4 mr-2" />,
      url: "#",
      items: [
        {
          title: "Favorites",
          url: "/user/dashboard/favorites",
        },
        {
          title: "Recently Viewed",
          url: "/user/dashboard/recently-viewed",
          icon: <Clock className="h-4 w-4" />
        },
      ],
    },
    {
      title: "Account",
      icon: <Settings className="h-4 w-4 mr-2" />,
      url: "#",
      items: [
        {
          title: "Settings",
          url: '/user/dashboard/settings',
        },
      ],
    },
  ]

  return (
    <Sidebar {...props} className="">
      <SidebarContent className="gap-1 px-2 pt-20">
        {dashboardNav.map((item) => (
          item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen={item.items.some(subItem => pathname === subItem.url)}
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
                >
                  <CollapsibleTrigger className="flex items-center w-full px-3 py-2">
                    {item.icon}
                    {item.title}
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton asChild isActive={pathname === subItem.url}>
                            <Link href={subItem.url} className="pl-9">
                              {subItem.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ) : (
            <SidebarGroup key={item.title}>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center px-3 py-2">
                      {item.icon}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
