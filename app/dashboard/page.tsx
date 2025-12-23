import { sql } from '@vercel/postgres';

async function getDashboardData(apiKey: string) {
  try {
    // Get user info and balance
    const userResult = await sql`
      SELECT 
        u.email,
        w.balance_usd,
        w.total_purchased_usd,
        ak.key,
        ak.name as key_name,
        ak.created_at as key_created
      FROM api_keys ak
      JOIN users u ON u.id = ak.user_id
      JOIN wallets w ON w.user_id = ak.user_id
      WHERE ak.key = ${apiKey}
      LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return null;
    }

    const userData = userResult.rows[0];

    // Get recent usage
    const usageResult = await sql`
      SELECT 
        model,
        input_tokens,
        output_tokens,
        cost_usd,
        created_at
      FROM usage_logs
      WHERE user_id = (SELECT user_id FROM api_keys WHERE key = ${apiKey})
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Calculate totals
    const totalSpent = parseFloat(userData.total_purchased_usd) - parseFloat(userData.balance_usd);
    const totalRequests = usageResult.rows.length;
    const totalTokens = usageResult.rows.reduce((sum, log) => 
      sum + log.input_tokens + log.output_tokens, 0
    );

    return {
      email: userData.email,
      balance: parseFloat(userData.balance_usd),
      totalPurchased: parseFloat(userData.total_purchased_usd),
      totalSpent,
      apiKey: userData.key,
      keyName: userData.key_name,
      keyCreated: userData.key_created,
      usage: usageResult.rows,
      stats: {
        totalRequests,
        totalTokens,
        avgCostPerRequest: totalRequests > 0 ? totalSpent / totalRequests : 0,
      }
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    return null;
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const params = await searchParams;
  const apiKey = params.key || '';
  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Dashboard Access</h1>
          <p className="text-gray-600 mb-4">
            Please provide your API key to view your dashboard.
          </p>
          <form method="GET" action="/dashboard" className="space-y-4">
            <input
              type="text"
              name="key"
              placeholder="sk_test_..."
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const data = await getDashboardData(apiKey);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Invalid API Key</h1>
          <p className="text-red-700">
            The API key you provided was not found. Please check and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">{data.email}</p>
            </div>
            <a href="/" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
              &larr; Back to Home
            </a>            
          </div>

          {/* Balance Card */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border-2 border-green-300">
              <div className="text-green-700 text-sm font-semibold mb-1">CURRENT BALANCE</div>
              <div className="text-4xl font-bold text-green-900">
                ${data.balance.toFixed(4)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300">
              <div className="text-blue-700 text-sm font-semibold mb-1">TOTAL PURCHASED</div>
              <div className="text-4xl font-bold text-blue-900">
                ${data.totalPurchased.toFixed(2)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-300">
              <div className="text-purple-700 text-sm font-semibold mb-1">TOTAL SPENT</div>
              <div className="text-4xl font-bold text-purple-900">
                ${data.totalSpent.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-semibold mb-1">TOTAL REQUESTS</div>
            <div className="text-3xl font-bold text-gray-900">{data.stats.totalRequests}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-semibold mb-1">TOTAL TOKENS</div>
            <div className="text-3xl font-bold text-gray-900">{data.stats.totalTokens.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm font-semibold mb-1">AVG COST / REQUEST</div>
            <div className="text-3xl font-bold text-gray-900">
              ${data.stats.avgCostPerRequest.toFixed(6)}
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">API Key</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">{data.keyName}</div>
                <code className="text-sm font-mono text-gray-800 break-all">{data.apiKey}</code>
                <div className="text-xs text-gray-500 mt-1">
                  Created {new Date(data.keyCreated).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Usage */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Usage</h2>
          {data.usage.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No usage yet. Make your first API call!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Model</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Input</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Output</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.usage.map((log, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                          {log.model.includes('gpt') ? 'GPT-4o-mini' : 'Claude Haiku'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">
                        {log.input_tokens.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600">
                        {log.output_tokens.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                        ${parseFloat(log.cost_usd).toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
