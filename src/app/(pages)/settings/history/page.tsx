import React from 'react'
import MessageHistory from '@/components/settings/message-history'
import DangerZone from '@/components/settings/danger-zone'
import { searchThread } from '@/action/thread.action'


const page = async () => {
  const { data, error } = await searchThread({});
  console.log("data", data);
  console.log("error", error);
  return (
    <div className="p-4">
      <MessageHistory data={data} />
      {/* <DangerZone /> */}
    </div>
  )
}

export default page