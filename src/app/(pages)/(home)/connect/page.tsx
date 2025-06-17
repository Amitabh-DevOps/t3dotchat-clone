import React from "react";
import OpenRouterConnect from "@/components/open-router/open-router-connect";
import { getUser } from "@/action/user.action";
import { redirect } from "next/navigation";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) => {
  const code = (await searchParams).code;
  // const user = await getUser();
  // if (user?.data?.openRouterApiKey && user?.data?.openRouterApiKey.trim() != "") {
  //   redirect("/");
  // }

  return (
    <div>
      <OpenRouterConnect code={code} />
    </div>
  );
};

export default page;