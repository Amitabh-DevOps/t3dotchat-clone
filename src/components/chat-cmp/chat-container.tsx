"use client";
import React from "react";
import { useIsMutating, useQuery, useMutationState } from "@tanstack/react-query";
import { getMessages } from "@/action/message.action";
import { useParams } from "next/navigation";
import { useStore } from "zustand";
import chatStore from "@/stores/chat.store";

const ChatContainer = () => {
  const params = useParams();
  const { response } = chatStore();
  console.log(params.chatid);
  
  const { data: messages, isLoading } = useQuery({
    queryKey: ["thread-messages"],
    queryFn: async () => {
      const posts = await getMessages({ threadId: params.chatid as string });
      return posts.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const isMutating = useIsMutating({ mutationKey: ['chat-stream'] });
  
  // Extract the query from the mutation payload
  const mutationData = useMutationState({
    filters: { 
      mutationKey: ['chat-stream'], 
      status: 'pending' 
    },
    select: (mutation) => ({
      query: mutation.state.variables?.query || mutation.state.variables?.userQuery, // Adjust based on your payload structure
      payload: mutation.state.variables, // Full payload for debugging
    })
  });

  // Get the current query from the first pending mutation
  const currentQuery = mutationData?.[0]?.query;
  
  return (
    <div className="h-[200vh] max-w-3xl mx-auto">
      {messages?.map((message) => (
        <div key={message._id}>
          <p>{message.userQuery}</p>
          <p>{message.aiResponse[0].content}</p>
        </div>
      ))}
      {isMutating > 0 ? (
        <div>
          <div>{currentQuery}</div>
          <div>{response}</div>
        </div>
      ) : null}
    </div>
  );
};

export default ChatContainer;