import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { connectToOpenRouter } from "@/action/open-router.action";
import { getGeneratedCodeChallenge } from "@/lib/code-challenge";
import { ArrowRight } from "lucide-react";

interface OpenRouterConnectProps {
  code?: string;
}

const OpenRouterConnect = async ({ code }: OpenRouterConnectProps) => {
  const generatedCodeChallenge = await getGeneratedCodeChallenge();

  // Handle connection if code is provided
  if (code) {
    await connectToOpenRouter(code);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 max-w-xl text-left mx-auto">
      <div className="text-left mb-2">
        <h1 className="text-3xl font-bold mb-10">
          Connect your OpenRouter account to start chatting
        </h1>

        <Link
          href={`https://openrouter.ai/auth?callback_url=${process.env.OPEN_ROUTER_REDIRECT_URI}&code_challenge=${generatedCodeChallenge}&code_challenge_method=S256`}
        >
          <Button size={"lg"} className="mb-8 px-8 py-3 text-lg rounded-full">
            Connect <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="w-full h-10">
        <Accordion collapsible type="single" className="w-full">
          <AccordionItem value="what-is-openrouter">
            <AccordionTrigger className="text-left">
              What is OpenRouter?
            </AccordionTrigger>
            <AccordionContent>
              OpenRouter is a unified API service that provides access to a
              collection of AI models from leading companies in one place.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="usage-limits">
            <AccordionTrigger className="text-left">
              Can I set usage limits?
            </AccordionTrigger>
            <AccordionContent>
              Yes, you can set usage limits and spending caps to control your
              costs when using OpenRouter services.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default OpenRouterConnect;
