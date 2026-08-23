/**
 * Robert Azucena Portfolio — "Let's Connect" chat backend
 * Runs on Cloudflare Workers (free tier). Holds the Anthropic API key
 * server-side so it never touches the public GitHub Pages site.
 *
 * Deploy: see README.md in this folder.
 */

// Only allow requests from your own site (swap in your real domain(s))
const ALLOWED_ORIGINS = [
  'https://robertazucena.com',
  'https://www.robertazucena.com',
  'https://robertazucena.github.io',
  'http://localhost:3000', // handy for local testing, remove if not needed
];

const SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant embedded on Robert Azucena's portfolio website. You answer visitor questions about Robert's work, background, and skills. Be concise, warm, and specific — pull from the facts below rather than making things up. If something isn't covered here, say you're not sure and suggest the visitor use the "Email Me" option to ask Robert directly. Never invent clients, dates, or numbers not listed below.

ABOUT ROBERT
Robert Azucena is a UX/UI Architect & Creative Strategist based in Singapore. He designs at the intersection of AI and function — where systems thinking meets thoughtful craft and human experience. He previously worked at Oracle, and with various early-stage ventures.

SKILLS
UX Research, UI Architecture, Figma, Creative Direction, User Interface Design, Design Systems, Information Architecture, Interaction Design, Prototyping, Accessibility (a11y), Motion Design.

FEATURED PROJECTS

1. Great Eastern — AI-powered insurance claims management web app (Lead Product Designer, Shipped 2026). An AI claims control center centralizing intake, review, and resolution workflows for auto insurance claims, with real-time dashboards, a submission queue, and AI-assisted damage assessment reporting.

2. Courtly — Sports court booking platform (Lead Product Designer, Shipped 2025). Helps users discover nearby courts, book them, track activity streaks, and join community pickup games across basketball, volleyball, futsal, etc.

3. Oracle AI Email Generator ("Oracle EG") — AI email platform (Lead Product Designer, Shipped 2024). Turns prompts into ready-to-send HTML email templates for enterprise teams, with a split-pane live editor, template gallery, and delivery/engagement analytics.

4. Changi (Changi Airport Group) — Cloud pricing comparison dashboard (Lead Product Designer, Shipped 2025). Compares Oracle Cloud Infrastructure costs against AWS/Azure/Google Cloud, with ROI summaries, a configurator, and multi-cloud TCO charts.

5. Oracle Autonomous Database ("Oracle AD") — Enterprise campaign web experience (Creative Technologist, Live 2023). An interactive marketing site for Oracle's self-driving, self-healing database, built with Larry Ellison's team; Robert led UI/UX and delivered the full web app.

6. Steady — Health & wellness dashboard (Lead Product Designer, Shipped 2026). Tracks heart rate, sleep, steps, nutrition, and hydration in one calming, warm-toned dashboard with habit streaks and gentle reminders.

7. MUFG — Financial services web app (UI/UX Designer & Creative Technologist, Beta 2023). A modern, trustworthy corporate site for MUFG's Asia Pacific banking services, covering lending, cash management, trade finance, and sustainability/ESG content.

8. Grab — Employee portal (Lead Designer, Shipped 2024). An internal employee experience platform with personalized tasks, company news, analytics dashboards, and a team directory, using Grab's signature green branding.

CONTACT
Visitors who want to reach Robert directly should use the "Email Me" button on the site, or connect via LinkedIn (linked in the dock).`;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    try {
      const { messages } = await request.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'messages array is required' }), {
          status: 400,
          headers: corsHeaders(origin),
        });
      }

      // Basic guardrails: cap history length and message size sent upstream
      const trimmed = messages.slice(-20).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 4000),
      }));

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5', // check docs.claude.com for the current recommended model id
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: trimmed,
        }),
      });

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text();
        console.error('Anthropic API error:', anthropicRes.status, errText);
        return new Response(JSON.stringify({ error: 'Upstream API error' }), {
          status: 502,
          headers: corsHeaders(origin),
        });
      }

      const data = await anthropicRes.json();
      const reply = data?.content?.find(b => b.type === 'text')?.text
        || "Sorry, I couldn't generate a response — please try again.";

      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: corsHeaders(origin),
      });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Something went wrong' }), {
        status: 500,
        headers: corsHeaders(origin),
      });
    }
  },
};
