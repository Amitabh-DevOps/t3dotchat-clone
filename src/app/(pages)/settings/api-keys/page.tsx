import React from 'react'
import { getThread } from '@/action/thread.action'

const page = async () => {
  const { data, error } = await getThread();

  console.log("data", data);
  console.log("error", error);

  return (
    <div>page</div>
  )
}

export default page