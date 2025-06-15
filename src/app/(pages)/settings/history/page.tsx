import React from 'react'
import MessageHistory from '@/components/settings/message-history'
import DangerZone from '@/components/settings/danger-zone'


const page = () => {
  return (
    <div className="p-4">
      <MessageHistory />
      <DangerZone />
      
    </div>
  )
}

export default page