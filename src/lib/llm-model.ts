export const llmModels = [
    {
        id: "#001", // if we favorite for 1 index model then in schema it store as #001[0]
        provider: "Google",
        apiKey: process.env.GEMINI_API_KEY,
        models: [
            {
                name: "Gemini 2.0 Flash",
                key: "gemini-2.0-flash",
                description: "The most powerful model in the Gemini family, designed for complex tasks and high-quality output.",
                image: "",
                features: [
                    {
                        key: "vision",
                        icon: ""
                    }
                ],
                favorite: false,
                selected: false,
            }
        ]
    },
    {
        id: "#002",
        provider: "OpenAi",
        apiKey: process.env.OPENAI_API_KEY,
        models: [
            {
                name: "gpt 4o",
                key: "gpt-4o",
                description: "The most powerful model in the OpenAI family, designed for complex tasks and high-quality output.",
                image: "",
                features: [
                    {
                        key: "vision",
                        icon: ""
                    }
                ],
                favorite: false,
                selected: false,
            }
        ]
    }
]