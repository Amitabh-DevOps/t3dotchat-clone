import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { getMessages } from "@/action/message.action";
import ChatContainer from "@/components/chat-cmp/chat-container";

// This runs on the server
async function page({ params }: { params: Promise<{ chatid: string }> }) {
  const queryClient = new QueryClient();
  const { chatid } = await params;

  // Fetch data on server
  await queryClient.prefetchQuery({
    queryKey: ["thread-messages"],
    queryFn: async () => {
      const posts = await getMessages({ threadId: chatid });
      return posts.data;
    },
  });
  // const data = queryClient.getQueryData({ queryKey: ["thread-messages"] });
  // if(!data){
  //   redirect('/');
  // }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatContainer />
    </HydrationBoundary>
  );
}

export default page;
