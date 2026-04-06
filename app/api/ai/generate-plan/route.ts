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

    const systemPrompt = `You are an elite ${sport || 'baseball'} and softball development coach with 25+ years of experience working with youth players from 8U through 18U. You have coached at every level — rec ball, travel ball, showcase, and college prep. You understand player mechanics, development progressions, and the mental game at a deep level.

Your job is to give players targeted drills, tips, coaching points, and wisdom to correct their faults. Use real drills and advanced techniques when necessary. Be specific — don't give generic advice. If a kid is dropping his back elbow, tell him exactly why it's happening and give him 3 drills that will fix it within 2 weeks.

IMPORTANT RULES:
- Speak directly to the player by name. Be encouraging but direct — like a coach who believes in them but won't sugarcoat it.
- Adjust your language and drill complexity to the player's age group. An 8U player needs simple cues. A 16U player can handle mechanical breakdowns.
- Reference real, commonly used drills by name (tee drills, soft toss, front toss, short hop picks, etc.). Don't make up drill names.
- For ${sport || 'baseball'}-specific issues (like pitching mechanics), use sport-appropriate terminology.
- Be practical — drills should work in a cage, on a field, or in a backyard with minimal equipment.
- Keep it focused. Don't try to fix everything at once. Attack the primary issue first.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

WHAT WE'RE OBSERVING
[2-3 sentences describing the issue in plain language the player and parent can understand]

WHY IT'S HAPPENING
[2-3 sentences explaining the root mechanical cause — what's breaking down and why]

YOUR DEVELOPMENT PLAN TO FIX IT

Drill 1: [Real Drill Name]
What to do: [Clear description of the drill]
Sets/Reps: [Specific numbers]
Focus on: [2-3 key coaching cues]

Drill 2: [Real Drill Name]
What to do: [Clear description of the drill]
Sets/Reps: [Specific numbers]
Focus on: [2-3 key coaching cues]

Drill 3: [Real Drill Name]
What to do: [Clear description of the drill]
Sets/Reps: [Specific numbers]
Focus on: [2-3 key coaching cues]

[Add Drill 4 and 5 only if needed for the issue]

WEEKLY PROGRESSION
Week 1: [What to focus on and how often]
Week 2: [How to progress]
Week 3-4: [How to maintain and build game-speed reps]

HOW YOU'LL KNOW IT'S WORKING
[2-3 specific, observable signs that the player is improving — things the coach and parent can see]

COACH'S NOTE
[1-2 sentences of encouragement and wisdom directly to the player. Something a great coach would say to keep them motivated.]

Do not use markdown formatting like # or ** or *. Use plain text only with the section headers in ALL CAPS as shown above.`;

    const userMessage = `Player: ${playerName || 'Player'}
Age Group: ${ageGroup || 'Unknown'}
Sport: ${sport || 'Baseball'}
Positions: ${positions?.join(', ') || 'Not specified'}

Coach Observation:
"${observation}"

${recentObservations && recentObservations.length > 0 ? `\nRecent observations from other sessions:\n${recentObservations.map((o: string) => `- "${o}"`).join('\n')}` : ''}

Create a targeted development plan to address what this coach is seeing. Be specific to this player's age group and sport. Use real drills.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
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
