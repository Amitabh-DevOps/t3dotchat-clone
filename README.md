# T4 Chat - Clone of T3.Chat

**🌐 Live Demo:** [https://t3dotchat-clone.vercel.app/](https://t3dotchat-clone.vercel.app/)

A powerful, feature-rich clone of [t3.chat](https://t3.chat) with advanced AI capabilities and seamless tool integration.

## ✨ Key Features

- **🔧 Dynamic Tool System** - Add any tool dynamically (image generation, web search, etc.)
- **🎨 Pixel-Perfect UI** - Consistent design with precise attention to detail
- **🧠 Smart Prompt Engineering** - Optimized AI behavior for relevant responses
- **🔗 OpenRouter Integration** - Effortless access to multiple LLM models
- **🤖 100+ LLM Models Access** - Wide variety of AI models for different use cases

## 🚀 Getting Started

### Prerequisites
- Node.js 18+, MongoDB, Google OAuth credentials

### Quick Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-username/t3dotchat-clone.git
   cd t3dotchat-clone
   npm install
   ```

2. **Environment Variables** - Create `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/t3dotchat
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   OPENROUTER_API_KEY=your-openrouter-api-key # Optional
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📋 Environment Variables Guide

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb://localhost:27017/t3dotchat` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | ✅ | `your-super-secret-key` |
| `NEXTAUTH_URL` | Base URL of your application | ✅ | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ | `123456789.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ | `your-google-secret` |
| `OPENROUTER_API_KEY` | OpenRouter API key for enhanced models | ❌ | `sk-or-v1-...` |


## 🤝 Contributing

1. Fork → Create branch → Commit → Push → Pull Request
2. We're committed to continuous improvement!

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 T4 Chat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🆘 Support

- GitHub Issues
- Website Contact
- Documentation

---

Built with ❤️ by the Huminex team