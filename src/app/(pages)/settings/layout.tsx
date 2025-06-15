import React from "react";
import Profile from "@/components/settings/profile";
import Header from "@/components/settings/header";
import TabNavigation from "@/components/settings/tab-navigation";

const layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="max-w-7xl mx-auto p-10">
      <Header />
      <div className="flex gap-10">
        <Profile />
        <div className="flex-1">
          <TabNavigation />
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;