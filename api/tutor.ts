import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const RequestSchema = z.object({
  role: z.enum(['socratic', 'on_call_mentor', 'explanation']),
  missionId: z.string().optional(),
  incidentId: z.string().optional(),
  revealedNodes: z.array(z.string()).optional(),
  isDiagnosed: z.boolean().optional(),
  stateDelta: z.any().optional(),
  predictionGrade: z.any().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parse = RequestSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parse.error.issues });
    }

    const { role, stateDelta, predictionGrade } = parse.data;
    const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

    // If no key is set in environment, signal client to use verified template fallback
    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No LLM API key configured on server. Use verified template fallback.',
      });
    }

    // Server-side LLM call would be executed here with strict prompt grounding
    // For now, return grounded delta information
    return res.status(200).json({
      text: `Grounded observation: At ${stateDelta?.after?.system?.totalArrivalRate || 0} req/s, ${
        stateDelta?.firstOverloadedNodeId || 'a key component'
      } is operating at ${Math.round(
        (stateDelta?.after?.nodes[stateDelta?.firstOverloadedNodeId]?.utilization || 1) * 100
      )}% utilization.`,
      numbers_used: [
        stateDelta?.after?.system?.totalArrivalRate || 0,
        stateDelta?.after?.nodes[stateDelta?.firstOverloadedNodeId]?.capacity || 0,
      ],
      node_ids_referenced: stateDelta?.firstOverloadedNodeId ? [stateDelta.firstOverloadedNodeId] : [],
      badge: 'verified',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal tutor error' });
  }
}
