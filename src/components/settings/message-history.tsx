"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Trash2 } from "lucide-react";

interface Message {
  id: string;
  title: string;
  timestamp: string;
  isPinned?: boolean;
}

const MessageHistory = () => {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [messages] = useState<Message[]>([
    {
      id: "1",
      title: "HTML Definition",
      timestamp: "6/15/2025, 3:38:39 PM",
      isPinned: true,
    },
    {
      id: "2",
      title: "Today's Summary",
      timestamp: "6/15/2025, 3:30:04 PM",
      isPinned: true,
    },
    {
      id: "3",
      title: "Weather Update Request",
      timestamp: "6/11/2025, 1:16:24 AM",
    },
    {
      id: "4",
      title: "Weather Update Request",
      timestamp: "6/11/2025, 1:03:17 AM",
    },
    {
      id: "5",
      title: "Weather Update Request",
      timestamp: "6/11/2025, 1:00:09 AM",
    },
    {
      id: "6",
      title: "Weather Update Request",
      timestamp: "6/11/2025, 12:59:40 AM",
    },
  ]);

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((msg) => msg.id));
    }
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log("Exporting messages:", selectedMessages);
  };

  const handleDelete = () => {
    // Implementation for delete functionality
    console.log("Deleting messages:", selectedMessages);
  };

  const handleImport = () => {
    // Implementation for import functionality
    console.log("Importing messages");
  };

  const allSelected = selectedMessages.length === messages.length;
  const someSelected =
    selectedMessages.length > 0 && selectedMessages.length < messages.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Message History
        </h2>
        <p className="text-sm text-muted-foreground">
          Save your history as JSON, or import someone else's. Importing will
          NOT delete existing messages
        </p>
      </div>

      {/* Message List */}
      {/* Controls */}
      <div className="flex w-full px-1 items-center justify-between">

        <Button
          variant="outline"
          size="sm"
          id="select-all"
          className="flex items-center space-x-2"
        >
          <Checkbox id="select-all" onCheckedChange={handleSelectAll} checked={allSelected} />
          <label
            htmlFor="select-all"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Select All
          </label>
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={selectedMessages.length === 0}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={selectedMessages.length === 0}
            className="flex items-center space-x-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
        </div>
      </div>
      <div className="h-50 overflow-y-auto">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {messages.map((message, index) => (
              <tr
                key={message.id}
                className="hover:bg-accent/50 transition-colors"
              >
                <td className="py-2 px-4">
                  <Checkbox
                    id={`message-${message.id}`}
                    checked={selectedMessages.includes(message.id)}
                    onCheckedChange={() => handleMessageSelect(message.id)}
                  />
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center space-x-2">
                    {message.isPinned && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0" />
                    )}
                    <label
                      htmlFor={`message-${message.id}`}
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      {message.title}
                    </label>
                  </div>
                </td>
                <td className="py-2 px-4 text-right">
                  <span className="text-sm text-muted-foreground">
                    {message.timestamp}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessageHistory;
