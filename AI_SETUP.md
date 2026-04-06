# AI Integration Setup

## 🎉 Phase 2 Milestone 2 Complete!

Your Darvis chat now has **full AI integration** with OpenAI! Messages stream in real-time, word-by-word.

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 2. Add API Key to Environment

Edit your `.env` file:

```bash
cd ~/Code/github/darobbins85/darvis-web
nano .env  # or use your favorite editor
```

Add this line:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Save and exit.

### 3. Restart the Server

```bash
pkill -f "deno run"  # Stop current server
./start-server.sh     # Start with AI enabled
```

### 4. Test AI Chat!

1. Open http://localhost:8000
2. Login or signup
3. Type a message: "Hello! Who are you?"
4. Watch the AI response stream in word-by-word! ✨

## What's Working Now

✅ **Real-time AI responses** - Streaming word-by-word  
✅ **Full conversation context** - AI remembers previous messages  
✅ **Multiple sessions** - Each chat has independent AI memory  
✅ **Message persistence** - Everything saved to database  
✅ **Error handling** - Graceful failures if API key missing

## Features

### Streaming Responses
- AI responses appear word-by-word as they're generated
- No waiting for complete response
- Real-time Server-Sent Events (SSE)

### Conversation Context
- AI sees all previous messages in the session
- Maintains context across the conversation
- Can reference earlier topics

### Model Configuration
- **Model:** `gpt-4o-mini` (fast, cost-effective)
- **Temperature:** 0.7 (balanced creativity)
- **Max Tokens:** 2000 (good length responses)

## System Prompt

Darvis uses this personality:

> You are Darvis, a helpful AI assistant. You are friendly, concise, and helpful.
> 
> Key traits:
> - Be conversational and natural
> - Keep responses focused and concise
> - Use markdown formatting when helpful
> - If asked to do something you can't do, explain clearly
> - Be honest about your limitations

## Testing Suggestions

Try these prompts to test the AI:

1. **Context Test:**
   - "My name is David"
   - Then: "What's my name?" (should remember)

2. **Multi-turn:**
   - "Tell me a joke"
   - "Explain that joke"

3. **Markdown Test:**
   - "Show me a code example in Python"
   - (Should format with code blocks)

4. **Multiple Sessions:**
   - Create 2 sessions
   - Ask different questions in each
   - Switch between them - context stays separate

## Troubleshooting

### "OPENAI_API_KEY environment variable is not set"
- Make sure you added the key to `.env`
- Restart the server after adding it

### Streaming not working
- Check browser console for errors
- Make sure your API key is valid
- Check OpenAI API status

### Slow responses
- Normal for gpt-4o-mini (1-3 seconds to start)
- Upgrade to gpt-4o for faster streaming
- Check your internet connection

## Cost Estimate

Using `gpt-4o-mini`:
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Average conversation: < $0.01
- Very affordable for development!

## Next Steps

With AI working, you can now:

1. ✅ Have full conversations with AI
2. ✅ Test multiple sessions
3. ✅ Verify message history persists
4. ⏳ Phase 3: Voice input/output (next!)
5. ⏳ Phase 4: App launching integration
6. ⏳ Phase 5: Visual polish and animations

---

**Phase 2 Core Features - COMPLETE!** 🎉

You now have a fully functional AI chat application with:
- User authentication
- Session management
- Real-time AI streaming
- Message persistence
- Beautiful (basic) UI

The foundation is solid and ready for voice features in Phase 3!
