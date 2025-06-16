import React from 'react'
import { getAttachmentMessage } from '@/action/message.action'
import AttachmentsList from '@/components/settings/attachments-list'

const page = async () => {
  const { data, error } = await getAttachmentMessage()
  
  return (
    <div className="p-4">
      <AttachmentsList data={data} />
    </div>
  )
}

export default page