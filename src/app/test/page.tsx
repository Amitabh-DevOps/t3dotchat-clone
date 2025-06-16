import React from "react";
import OpenRouterConnect from "@/components/open-router/open-router-connect";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) => {
  const code = (await searchParams).code;

  return (
    <div>
      <OpenRouterConnect code={code} />
    </div>
  );
};

export default page;
