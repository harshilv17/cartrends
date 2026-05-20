/**
 * Groq-powered insight generator.
 *
 * Sends computed employee + department stats to a Groq-hosted LLM
 * and asks it to write short, manager-friendly insights as JSON.
 *
 * If the API key is missing or the call fails, the calling code falls
 * back to the rule-based engine in analytics.ts.
 */
import type { DepartmentStats, EmployeeStats, Insight } from "./analytics";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function generateAIInsights(
  stats: EmployeeStats[],
  departments: DepartmentStats[]
): Promise<Insight[]> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");

  // Trim payload — only fields the model actually needs.
  const employeePayload = stats.map((s) => ({
    name: s.name,
    department: s.department,
    avgHours: s.avgHours,
    lateDays: s.lateDays,
    overtimeDays: s.overtimeDays,
    attendancePct: s.attendancePct,
    punctualityPct: s.punctualityPct,
    workingDays: s.workingDays,
  }));

  const userPrompt = `You are an HR analytics assistant for an attendance & timesheet tool.

Given the data below, generate 5 short insights a manager would care about.

EMPLOYEE STATS (avgHours = avg working hours/day):
${JSON.stringify(employeePayload, null, 2)}

DEPARTMENT STATS:
${JSON.stringify(departments, null, 2)}

Respond with valid JSON only, matching exactly this shape:
{
  "insights": [
    {
      "title": "string, max 6 words",
      "message": "1-2 sentences, must include a real name and a real number from the data",
      "type": "positive" | "warning" | "info"
    }
  ]
}

Rules:
- Produce 4 to 6 insights.
- Cover a mix of: most punctual employee, burnout/overtime risk,
  most productive department, late arrivals, low attendance, team average.
- "positive" for good news, "warning" for concerns, "info" for neutral facts.
- Do not invent numbers — only use values present in the stats above.`;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: "You return only valid JSON. No prose." },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { insights?: Insight[] };

  // Sanity check — make sure each entry has the expected shape.
  return (parsed.insights ?? []).filter(
    (i) => i && i.title && i.message && ["positive", "warning", "info"].includes(i.type)
  );
}
