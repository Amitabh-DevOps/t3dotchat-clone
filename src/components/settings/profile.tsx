import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getUser } from "@/action/user.action";
import { getMessageUsage } from "@/action/message.action";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const Profile = async () => {
  const [userData, messageUsage] = await Promise.all([
    getUser(),
    getMessageUsage(),
  ]);

  const user = userData.data;
  const message = messageUsage.data;

  return (
    <div className="w-80">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarImage src={user?.image} />
          <AvatarFallback className="text-xl font-bold">
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold mb-1">{user?.name}</h2>
        <p className="text-md text-muted-foreground font-medium mb-3">
          {user?.email}
        </p>
        <Badge variant="secondary">Special Plan</Badge>
      </div>

      {/* Message Usage */}
      {/* <div className="mb-6 mt-6 bg-black p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-zinc-300">
            Message Usage
          </span>
          <span className="text-xs text-zinc-500">
            Resets tomorrow at 5:30 AM
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-zinc-400">Standard</span>
          <span className="text-sm text-zinc-400">1/20</span>
        </div>
        <Progress value={message} className="mb-2" />
        <p className="text-xs text-zinc-500">{message} messages remaining</p>
      </div> */}

      {/* Keyboard Shortcuts */}
      <Card className="mt-6 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Search</span>
            <div className="flex gap-1">
              <Badge variant="secondary">
                <kbd className="px-2 py-1">Ctrl</kbd>
              </Badge>
              <Badge variant="secondary">
                <kbd className="px-2 py-1">K</kbd>
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">New Chat</span>
            <div className="flex gap-1">
              <Badge variant="secondary">
                <kbd className="px-2 py-1">Ctrl</kbd>
              </Badge>
              <Badge variant="secondary">
                <kbd className="px-2 py-1">Shift</kbd>
              </Badge>
              <Badge variant="secondary">
                <kbd className="px-2 py-1">O</kbd>
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Toggle Sidebar</span>
            <div className="flex gap-1">
              <Badge variant="secondary">
                <kbd className="px-2 py-1">Ctrl</kbd>
              </Badge>
              <Badge variant="secondary">
                <kbd className="px-2 py-1">B</kbd>
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
