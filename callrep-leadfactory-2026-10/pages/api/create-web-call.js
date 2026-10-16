import { Retell } from 'retell-sdk';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agent_id } = req.body;
    
    const agentId = agent_id || process.env.NEXT_PUBLIC_RETELL_PAUL_AGENT_ID;

    const response = await retell.call.createWebCall({
      agent_id: agentId,
    });

    return res.status(200).json({
      access_token: response.access_token,
      call_id: response.call_id,
    });
  } catch (error) {
    console.error('Retell createWebCall error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create web call' });
  }
}
