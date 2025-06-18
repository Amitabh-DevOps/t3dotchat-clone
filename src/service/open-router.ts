import { queryOptions } from "@tanstack/react-query";

const fetchOpenRouterModels = async (): Promise<any> => {
  const url = "https://openrouter.ai/api/v1/models";
  const options = { method: "GET" };
  const response = await fetch(url, options);
  return response.json();
};

export const openRouterModelsQueryOptions = queryOptions({
  queryKey: ["openRouterModels"],
  queryFn: fetchOpenRouterModels,
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  retry: 3,
});