export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-5xl font-bold text-gray-900">AI Proxy API</h1>
            <a 
              href="/dashboard" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
              View Dashboard
            </a>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Prepaid AI access with cost transparency. Perfect for students and hobbyists.
          </p>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg p-4">
            <p className="text-green-900 font-semibold text-lg">
              💡 Unique Feature: See the cost BEFORE you commit to a request
            </p>
            <p className="text-green-800 text-sm mt-1">
              Every API call shows you exactly how many tokens and dollars it will cost. Approve or revise your prompt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <div className="text-green-700 font-semibold text-sm">STATUS</div>
            <div className="text-2xl font-bold text-green-900">✓ LIVE</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="text-blue-700 font-semibold text-sm">MODELS</div>
            <div className="text-2xl font-bold text-blue-900">2 Active</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="text-purple-700 font-semibold text-sm">MARKUP</div>
            <div className="text-2xl font-bold text-purple-900">25%</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">1️⃣</span>
              <div>
                <div className="font-semibold">Send your prompt</div>
                <div className="text-gray-600 text-sm">Make an API request with any prompt</div>
              </div>
            </div>
            <div className="flex items-start bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
              <span className="text-2xl mr-3">2️⃣</span>
              <div>
                <div className="font-semibold text-yellow-900">Get cost estimate (NEW!)</div>
                <div className="text-yellow-800 text-sm">
                  See estimated tokens (~150) and cost (~$0.00008) before running
                </div>
                <div className="bg-white p-2 rounded mt-2 text-xs font-mono text-gray-700">
                  "This will cost $0.000075 (200 tokens). Balance after: $9.99"
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">3️⃣</span>
              <div>
                <div className="font-semibold">Confirm or revise</div>
                <div className="text-gray-600 text-sm">Add "confirm_cost": true to proceed, or change your prompt to save tokens</div>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">4️⃣</span>
              <div>
                <div className="font-semibold">Request executes</div>
                <div className="text-gray-600 text-sm">We route to the AI, track actual usage, and deduct from your balance</div>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">5️⃣</span>
              <div>
                <div className="font-semibold">See actual costs</div>
                <div className="text-gray-600 text-sm">Response includes real token count and cost breakdown</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Example: Cost Estimate Response</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-800">{`{
  "requires_confirmation": true,
  "estimate": {
    "input_tokens": 7,
    "output_tokens": 3,
    "total_tokens": 10,
    "cost_usd": 0.0000131,
    "cost_breakdown": {
      "base_cost": 0.0000105,
      "markup": 0.0000026,
      "markup_percentage": "25%"
    }
  },
  "balance": {
    "current": 9.9999,
    "after_request": 9.9998
  },
  "message": "This request will cost approximately $0.000013..."
}`}</pre>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Supported Models</h3>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">GPT-4o-mini</div>
                  <div className="text-sm text-gray-600">OpenAI</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-600">$0.15 / $0.60</div>
                  <div className="text-xs text-gray-500">per 1M tokens (in/out)</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">Fast, affordable, great for most tasks</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">Claude 3.5 Haiku</div>
                  <div className="text-sm text-gray-600">Anthropic</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-600">$0.80 / $4.00</div>
                  <div className="text-xs text-gray-500">per 1M tokens (in/out)</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">Nuanced understanding, excellent reasoning</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <strong>Note:</strong> Our prices include a 25% markup to cover infrastructure and support sustainable operation.
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-300 mb-6">
          <h3 className="text-lg font-bold text-green-900 mb-3">✅ Fully Operational - Production Ready</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Core API Features</h4>
              <ul className="space-y-1.5 text-green-800 text-sm">
                <li>✓ Multi-model routing (GPT-4o-mini, Claude Haiku)</li>
                <li>✓ Cost estimation before execution</li>
                <li>✓ Real-time balance checking</li>
                <li>✓ Accurate token counting & cost calculation</li>
                <li>✓ Automatic wallet deduction</li>
                <li>✓ 25% markup on upstream costs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Platform Features</h4>
              <ul className="space-y-1.5 text-green-800 text-sm">
                <li>✓ PostgreSQL database (Neon serverless)</li>
                <li>✓ API key authentication</li>
                <li>✓ Full usage logging & audit trail</li>
                <li>✓ User dashboard with analytics</li>
                <li>✓ Balance & spending tracking</li>
                <li>✓ Request history with cost breakdown</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-sm text-green-800">
              <strong>Tech Stack:</strong> Next.js 15, TypeScript, PostgreSQL, Vercel, OpenAI SDK, Anthropic SDK
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl shadow p-6 border border-blue-200 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Current Demo Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-900">2</div>
              <div className="text-sm text-blue-700">AI Models</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">~$0.0001</div>
              <div className="text-sm text-blue-700">Avg Cost/Request</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">100%</div>
              <div className="text-sm text-blue-700">Uptime</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl shadow p-6 border border-yellow-200 mb-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">🎓 Perfect for Students & Hobbyists</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li><strong>Learn AI costs:</strong> See exactly how prompt length affects pricing</li>
            <li><strong>No surprise bills:</strong> Pre-approve every request's cost</li>
            <li><strong>Fixed budgets:</strong> Load $10 and experiment safely</li>
            <li><strong>Compare models:</strong> See cost differences between GPT and Claude</li>
          </ul>
        </div>

        <div className="bg-indigo-50 rounded-xl shadow p-6 border border-indigo-200 mb-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">🚧 Roadmap (Post-Approval)</h3>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• Stripe payment integration (test mode ready)</li>
            <li>• Email notifications for low balance</li>
            <li>• API key management UI (create/revoke)</li>
            <li>• Usage analytics & insights</li>
            <li>• Rate limiting per API key</li>
            <li>• Additional models (Gemini, GPT-4)</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-block bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Project Status:</strong> Proof of concept → Fully functional product
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Built in <span className="font-bold text-green-600">one afternoon</span> (Dec 22, 2024)
            </p>
            <p className="text-xs text-gray-500">
              Ready for production deployment pending business approval
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
