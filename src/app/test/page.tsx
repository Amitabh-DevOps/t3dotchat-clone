import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { getGeneratedCodeChallenge } from "@/lib/code-challenge";
import { connectToOpenRouter } from "@/action/open-router.action";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) => {
  const code = (await searchParams).code;
  const generatedCodeChallenge = await getGeneratedCodeChallenge();

  if (code) {
    await connectToOpenRouter(code);
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Open Router</h1>

        <Link
          href={`https://openrouter.ai/auth?callback_url=${process.env.OPEN_ROUTER_REDIRECT_URI}&code_challenge=${generatedCodeChallenge}&code_challenge_method=S256`}
        >
          <Button className="mt-4">Connect Now</Button>
        </Link>
      </div>
    </div>
  );
};

export default page;
