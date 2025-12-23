# AI Proxy API

**Prepaid AI access with cost transparency - built for students and hobbyists**

A weekend project exploring how to make AI API access safer and more educational for developers learning to work with LLMs.

🔗 **Live Demo**: [ai-proxy-murex-two.vercel.app](https://ai-proxy-murex-two.vercel.app)

---

## The Problem

AI APIs are powerful but intimidating for newcomers:
- Fear of runaway costs from a coding mistake
- No understanding of what prompts actually cost
- Managing multiple API keys across providers is cumbersome
- Students and hobbyists want fixed budgets, not pay-as-you-go with credit cards

## The Solution

A prepaid API proxy that:
1. **Shows cost estimates BEFORE execution** - see tokens and dollars before committing
2. **Provides a single API key** for multiple models (GPT, Claude)
3. **Enforces hard budget limits** - when your $10 runs out, requests stop
4. **Logs everything** - learn how different prompts affect costs

### Unique Differentiator

Unlike standard API providers, every request requires **cost approval**:
```json
{
  "requires_confirmation": true,
  "estimate": {
    "total_tokens": 200,
    "cost_usd": 0.000075
  },
  "message": "This request will cost $0.000075. Your balance will be $9.92"
}
```

Users can revise prompts to save tokens or confirm to proceed. This turns every API call into a learning moment about AI economics.

---

## Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router), TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **AI APIs**: OpenAI, Anthropic
- **Hosting**: Vercel
- **Payments**: Stripe (roadmap)

## Features

✅ **Core API**
- Multi-model routing (GPT-4o-mini, Claude 3.5 Haiku)
- Cost estimation before execution
- Real-time balance checking
- Accurate token counting & cost calculation
- 25% markup on upstream costs

✅ **Platform**
- PostgreSQL database with full audit trail
- API key authentication
- Usage logging per request
- User dashboard with analytics
- Balance & spending tracking

## Architecture

```
User Request
    ↓
API Route (/api/chat)
    ↓
[1] Validate API key (PostgreSQL)
[2] Estimate cost
[3] Return estimate → User approves
[4] Route to OpenAI/Anthropic
[5] Calculate actual cost
[6] Deduct from wallet
[7] Log usage
    ↓
Return response + remaining balance
```

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Neon account)
- OpenAI API key
- Anthropic API key

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-proxy.git
cd ai-proxy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys:
# OPENAI_API_KEY=your_key
# ANTHROPIC_API_KEY=your_key
# POSTGRES_URL=your_connection_string

# Initialize database
npm run setup-db

# Create a test user
npm run create-user
# Copy the API key it generates

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

### Usage Example

**Step 1: Get cost estimate**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "messages": [{"role": "user", "content": "Explain async/await"}]
  }'
```

Returns:
```json
{
  "requires_confirmation": true,
  "estimate": {
    "input_tokens": 4,
    "output_tokens": 2,
    "cost_usd": 0.000013
  },
  "balance": {
    "current": 10.00,
    "after_request": 9.999987
  }
}
```

**Step 2: Confirm and execute**
```bash
# Same request, add "confirm_cost": true
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "messages": [{"role": "user", "content": "Explain async/await"}],
    "confirm_cost": true
  }'
```

## Database Schema

```sql
users (id, email, created_at)
api_keys (id, user_id, key, name, is_active)
wallets (id, user_id, balance_usd, total_purchased_usd)
usage_logs (id, api_key_id, model, input_tokens, output_tokens, cost_usd, created_at)
purchases (id, user_id, stripe_payment_id, amount_usd, created_at)
```

## Roadmap

- [ ] Stripe payment integration
- [ ] Email notifications for low balance
- [ ] API key management UI
- [ ] Rate limiting per key
- [ ] Usage analytics & insights
- [ ] Additional models (Gemini, GPT-4)
- [ ] Webhook support for balance alerts
- [ ] Team/organization accounts

## Development Timeline

This project was built in **one afternoon** (Dec 22, 2024) as a proof of concept to explore:
- Business model viability for prepaid AI services
- Technical feasibility of cost-aware API proxying
- Educational value of transparent pricing

## Cost Economics

**Example:** Claude 3.5 Haiku
- Anthropic charges: $0.80 input / $4.00 output per 1M tokens
- We charge: $1.00 input / $5.00 output (25% markup)
- A 100-token request + 50-token response costs: ~$0.00035

**Margins are thin** - this is designed for learning, not profit. At scale, costs could be optimized through:
- Prompt caching
- Request batching  
- Cheaper hosting
- Volume discounts from providers

## Lessons Learned

1. **Cost transparency matters** - users appreciate knowing exactly what they're spending
2. **Prepaid reduces anxiety** - fixed budgets eliminate "what if my script runs forever" fears
3. **Educational value** - showing token counts teaches prompt engineering
4. **Thin margins** - competing on price alone isn't viable; need value-add features
5. **Database is critical** - reliable usage tracking is non-negotiable for billing

## Contributing

This is currently a proof-of-concept side project. Contributions, suggestions, and feedback welcome!

## License

MIT License - feel free to use this as a learning resource or starting point for your own projects.

## Acknowledgments

Built as a weekend exploration of prepaid AI service economics. Inspired by the need for safer, more educational AI API access for students and hobbyists.

---

**Note**: This is a demonstration project. For production use, you'd want to add:
- Proper authentication (OAuth, email verification)
- Payment processing (Stripe integration)
- Rate limiting and abuse prevention
- Monitoring and alerting
- Terms of Service and Privacy Policy
- Customer support infrastructure
