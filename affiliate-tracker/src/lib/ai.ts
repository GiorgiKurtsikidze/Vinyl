import { DEAL_STATUSES, type DealStatus } from '../types/deal';

const OPENAI_BASE_URL =
  import.meta.env.VITE_OPENAI_BASE_URL ?? 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o-mini';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface StructuredDealInput {
  name: string;
  geo?: string;
  source?: string;
  model?: string;
  status?: DealStatus;
  details?: string;
  next?: string;
}

export interface ParsedAiResult {
  summary?: string;
  deals: StructuredDealInput[];
}

export async function parseUpdatesWithAI(raw: string): Promise<ParsedAiResult> {
  if (!raw.trim()) {
    throw new Error('Please paste some updates first.');
  }
  if (!OPENAI_API_KEY) {
    throw new Error('Missing VITE_OPENAI_API_KEY. Add it to your .env file.');
  }

  const body = {
    model: OPENAI_MODEL,
    temperature: 0.15,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'affiliate_deal_updates',
        schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'One sentence summary of the note batch.',
            },
            deals: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', description: 'Partner or deal name' },
                  geo: { type: 'string', enum: ['UK', 'DE', 'NL', 'GLOBAL'] },
                  source: { type: 'string' },
                  model: { type: 'string' },
                  status: { type: 'string', enum: DEAL_STATUSES },
                  details: { type: 'string' },
                  next: { type: 'string' },
                },
              },
            },
          },
          required: ['deals'],
        },
      },
    },
    messages: [
      {
        role: 'system',
        content:
          'You are an SDR coordinator that converts raw field updates into structured CRM-ready deal updates. Only output valid JSON that matches the provided schema.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Please extract structured affiliate deal updates from the following notes.',
              'Fill missing values with empty strings; do not hallucinate.',
              'Use concise phrasing for details and next steps.',
              '',
              raw.trim(),
            ].join('\n'),
          },
        ],
      },
    ],
  };

  const response = await fetch(OPENAI_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI request failed (${response.status}): ${text}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI response missing content.');
  }

  let parsed: ParsedAiResult;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON.');
  }

  return {
    summary: parsed.summary,
    deals: Array.isArray(parsed.deals) ? parsed.deals : [],
  };
}
