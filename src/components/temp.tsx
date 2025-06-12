'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMessages } from '@/action/message.action'
const Temp = () => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['thread-messages'],
    queryFn: async () => {
      const posts = await getMessages({ threadId: '684a57caa409763e9c9d1e10' })
      return posts.data
    },
    // This ensures the query stays active and can be invalidated
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  return (
    <div>Temp</div>
  )
}

export default Temp