import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { observation, playerName, ageGroup, sport, positions, recentObservations } = await request.json();

    if (!observation) {
      return NextResponse.json({ error: 'Observation is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert elite baseball and softball development coach with 20+ years of experience working with youth players ages 8U through 18U. You create personalized, actionable development plans based on coach observations.

Your plans should:
- Be specific to the player's age group and sport
- Include 3-5 drills with clear progressions
- Specify sets, reps, and frequency
- Include coaching cues the player should focus on
- Build from simple to complex over 2-4 weeks
- Be practical for a cage, field, or backyard setting
- Speak directly to the player in an encouraging but direct tone

Format your response as a structured development plan with:
1. A brief assessment of what's being observed
2. The root cause (why this is happening mechanically)
3. Numbered drills with name, description, sets/reps, and key coaching points
4. A weekly progression timeline
5. What success looks like (how to know it's improving)

Do not use markdown headers with #. Use plain text with clear sections separated by line breaks. Use numbered lists for drills.`;

    const userMessage = `Player: ${playerName || 'Player'}
Age Group: ${ageGroup || 'Unknown'}
Sport: ${sport || 'Baseball'}
Positions: ${positions?.join(', ') || 'Not specified'}

Coach Observation:
"${observation}"

${recentObservations && recentObservations.length > 0 ? `\nRecent observations from other coaches:\n${recentObservations.map((o: string) => `- "${o}"`).join('\n')}` : ''}

Generate a personalized development plan to address what this coach is observing.`;

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
      return NextResponse.json({ error: errorData.error?.message || 'AI generation failed' }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text || 'Unable to generate plan. Please try again.';

    return NextResponse.json({ plan: aiResponse });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
