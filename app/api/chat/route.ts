// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { sql } from '@vercel/postgres';

// Model pricing per 1M tokens (input/output)
const MODEL_PRICING = {
  'gpt-4o-mini': { input: 0.150, output: 0.600 },
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
} as const;

type ModelName = keyof typeof MODEL_PRICING;

const MARKUP = 1.25; // 25% markup on costs

// Estimate tokens (rough approximation for preflight check)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Calculate cost in dollars
function calculateCost(model: ModelName, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    const body = await req.json();
    const { model, messages, mock, confirm_cost } = body;

    if (!model || !messages) {
      return NextResponse.json({ error: 'Missing model or messages' }, { status: 400 });
    }

    if (!(model in MODEL_PRICING)) {
      return NextResponse.json({ 
        error: `Unsupported model. Supported: ${Object.keys(MODEL_PRICING).join(', ')}` 
      }, { status: 400 });
    }

    // Validate API key and get user
    const apiKeyResult = await sql`
      SELECT ak.id as api_key_id, ak.user_id, ak.is_active, w.balance_usd
      FROM api_keys ak
      JOIN wallets w ON w.user_id = ak.user_id
      WHERE ak.key = ${apiKey}
    `;

    if (apiKeyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { api_key_id, user_id, is_active, balance_usd } = apiKeyResult.rows[0];

    if (!is_active) {
      return NextResponse.json({ error: 'API key is disabled' }, { status: 401 });
    }

    // Estimate cost
    const inputText = messages.map((m: any) => m.content).join(' ');
    const estimatedInputTokens = estimateTokens(inputText);
    const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 0.5); // Rough estimate
    const estimatedCost = calculateCost(model as ModelName, estimatedInputTokens, estimatedOutputTokens) * MARKUP;

    // COST CONFIRMATION FLOW - if confirm_cost is not true, return estimate
    if (confirm_cost !== true) {
      const currentBalance = parseFloat(balance_usd);
      
      return NextResponse.json({
        requires_confirmation: true,
        estimate: {
          input_tokens: estimatedInputTokens,
          output_tokens: estimatedOutputTokens,
          total_tokens: estimatedInputTokens + estimatedOutputTokens,
          cost_usd: estimatedCost,
          cost_breakdown: {
            base_cost: estimatedCost / MARKUP,
            markup: estimatedCost - (estimatedCost / MARKUP),
            markup_percentage: '25%'
          }
        },
        balance: {
          current: currentBalance,
          after_request: currentBalance - estimatedCost
        },
        message: `This request will cost approximately $${estimatedCost.toFixed(6)} (${estimatedInputTokens + estimatedOutputTokens} tokens). Your balance will be $${(currentBalance - estimatedCost).toFixed(4)}. To proceed, send the same request with "confirm_cost": true`,
        model
      });
    }

    // Check balance
    if (parseFloat(balance_usd) < estimatedCost * 2) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        balance_usd: parseFloat(balance_usd),
        estimated_cost: estimatedCost
      }, { status: 402 });
    }

    // Update last_used_at
    await sql`
      UPDATE api_keys 
      SET last_used_at = NOW() 
      WHERE id = ${api_key_id}
    `;
    
    // MOCK MODE for demo purposes
    if (mock === true) {
      const mockInputTokens = estimatedInputTokens;
      const mockOutputTokens = 50;
      const mockCost = calculateCost(model as ModelName, mockInputTokens, mockOutputTokens) * MARKUP;
      
      // Deduct from wallet
      await sql`
        UPDATE wallets 
        SET balance_usd = balance_usd - ${mockCost}
        WHERE user_id = ${user_id}
      `;

      // Log usage
      await sql`
        INSERT INTO usage_logs (api_key_id, user_id, model, input_tokens, output_tokens, cost_usd)
        VALUES (${api_key_id}, ${user_id}, ${model}, ${mockInputTokens}, ${mockOutputTokens}, ${mockCost})
      `;

      const newBalance = parseFloat(balance_usd) - mockCost;
      
      return NextResponse.json({
        content: `[MOCK RESPONSE] This is a simulated ${model} response. In production, this would be the actual AI output.`,
        model,
        usage: {
          input_tokens: mockInputTokens,
          output_tokens: mockOutputTokens,
        },
        cost_usd: mockCost,
        balance_remaining_usd: newBalance,
        mock: true,
      });
    }
    
    // Route to appropriate API
    let response;
    let actualInputTokens = 0;
    let actualOutputTokens = 0;

    if (model.startsWith('gpt-')) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model,
        messages,
      });
      
      actualInputTokens = completion.usage?.prompt_tokens || 0;
      actualOutputTokens = completion.usage?.completion_tokens || 0;
      
      response = {
        content: completion.choices[0].message.content,
        model: completion.model,
        usage: {
          input_tokens: actualInputTokens,
          output_tokens: actualOutputTokens,
        },
      };
    } else if (model.startsWith('claude-')) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const completion = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        messages,
      });
      
      actualInputTokens = completion.usage.input_tokens;
      actualOutputTokens = completion.usage.output_tokens;
      
      response = {
        content: completion.content[0].type === 'text' ? completion.content[0].text : '',
        model: completion.model,
        usage: {
          input_tokens: actualInputTokens,
          output_tokens: actualOutputTokens,
        },
      };
    } else {
      return NextResponse.json({ error: 'Model routing not implemented' }, { status: 501 });
    }

    // Calculate actual cost with markup
    const actualCost = calculateCost(model as ModelName, actualInputTokens, actualOutputTokens) * MARKUP;

    // Deduct from wallet
    await sql`
      UPDATE wallets 
      SET balance_usd = balance_usd - ${actualCost}
      WHERE user_id = ${user_id}
    `;

    // Log usage
    await sql`
      INSERT INTO usage_logs (api_key_id, user_id, model, input_tokens, output_tokens, cost_usd)
      VALUES (${api_key_id}, ${user_id}, ${model}, ${actualInputTokens}, ${actualOutputTokens}, ${actualCost})
    `;

    // Get new balance
    const balanceResult = await sql`
      SELECT balance_usd FROM wallets WHERE user_id = ${user_id}
    `;
    const newBalance = parseFloat(balanceResult.rows[0].balance_usd);

    return NextResponse.json({
      ...response,
      cost_usd: actualCost,
      balance_remaining_usd: newBalance,
      cost_breakdown: {
        base_cost: actualCost / MARKUP,
        markup: actualCost - (actualCost / MARKUP),
        you_paid: actualCost
      }
    });

  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
