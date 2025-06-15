"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const TabNavigation = () => {
  const pathname = usePathname();
  
  const tabs = [
    { name: "Account", href: "/settings/subscription" },
    { name: "Customization", href: "/settings/customization" },
    { name: "History & Sync", href: "/settings/history" },
    { name: "Models", href: "/settings/models" },
    { name: "API Keys", href: "/settings/api-keys" },
    { name: "Attachments", href: "/settings/attachments" },
    { name: "Contact Us", href: "/settings/contact" },
  ];

  return (
    <div className="grid grid-cols-7 gap-1 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.name} href={tab.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full px-4 py-2 text-sm ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {tab.name}
            </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default TabNavigation; 