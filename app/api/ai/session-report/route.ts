import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { coachName, playerName, ageGroup, sport, positions, sessionNotes, workedOn, improved, focusNext } = await request.json();

    if (!sessionNotes && !workedOn) {
      return NextResponse.json({ error: 'Session details are required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are writing a professional session report for a youth ${sport || 'baseball'} coach to share with a player's family. The report should be clear, specific, and encouraging — like a great coach updating a parent after a lesson.

Write in first person as the coach. Keep it concise but informative. Parents want to know: what was worked on, what improved, and what to focus on before next session.

Format the report EXACTLY like this (plain text, no markdown):

SESSION SUMMARY
[2-3 sentences summarizing what was covered today]

WHAT WE WORKED ON
[3-5 bullet points starting with • describing specific drills and focus areas]

PROGRESS NOTED
[2-3 sentences about what improved or clicked during the session]

BEFORE NEXT SESSION
[2-3 specific things the player should practice or think about]

COACH'S NOTE
[1-2 sentences of encouragement directly to the player]

Keep the tone professional but warm. Use the player's first name. Do not use markdown formatting like # or ** or *.`;

    const userMessage = `Coach: ${coachName || 'Coach'}
Player: ${playerName || 'Player'}
Age Group: ${ageGroup || 'Unknown'}
Sport: ${sport || 'Baseball'}
Positions: ${positions || 'Not specified'}

What we worked on: ${workedOn || 'Not specified'}
What improved: ${improved || 'Not specified'}
What to focus on next: ${focusNext || 'Not specified'}
Additional notes: ${sessionNotes || 'None'}

Generate a polished session report for this player's family.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || 'Report generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const report = data.content[0]?.text || 'Unable to generate report. Please try again.';

    return NextResponse.json({ report });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
