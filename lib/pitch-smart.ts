// Pitch Smart Guidelines
// Returns required rest days based on age group and pitch count

const PITCH_RULES: Record<string, { max: number; rest: [number, number, number][] }> = {
  '7U':  { max: 50,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2]] },
  '8U':  { max: 50,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2]] },
  '9U':  { max: 75,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2], [51, 65, 3], [66, 75, 4]] },
  '10U': { max: 75,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2], [51, 65, 3], [66, 75, 4]] },
  '11U': { max: 85,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2], [51, 65, 3], [66, 85, 4]] },
  '12U': { max: 85,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2], [51, 65, 3], [66, 85, 4]] },
  '13U': { max: 95,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2], [51, 65, 3], [66, 95, 4]] },
  '14U': { max: 95,  rest: [[1, 20, 0], [21, 35, 1], [36, 50, 2], [51, 65, 3], [66, 95, 4]] },
  '15U': { max: 95,  rest: [[1, 30, 0], [31, 45, 1], [46, 60, 2], [61, 75, 3], [76, 95, 4]] },
  '16U': { max: 95,  rest: [[1, 30, 0], [31, 45, 1], [46, 60, 2], [61, 75, 3], [76, 95, 4]] },
  '17U': { max: 105, rest: [[1, 30, 0], [31, 45, 1], [46, 60, 2], [61, 80, 3], [81, 105, 4]] },
  '18U': { max: 105, rest: [[1, 30, 0], [31, 45, 1], [46, 60, 2], [61, 80, 3], [81, 105, 4]] },
};

export function getMaxPitches(ageGroup: string): number {
  return PITCH_RULES[ageGroup]?.max || 75;
}

export function getRequiredRestDays(ageGroup: string, pitchCount: number): number {
  const rules = PITCH_RULES[ageGroup]?.rest;
  if (!rules) return 1;
  for (const [min, max, days] of rules) {
    if (pitchCount >= min && pitchCount <= max) return days;
  }
  return 4; // default to max rest if over limit
}

export type PitchStatus = 'green' | 'yellow' | 'red';

export interface PitchAvailability {
  status: PitchStatus;
  label: string;
  daysRemaining: number;
  lastOuting: {
    date: string;
    pitchCount: number;
    outingType: string;
  } | null;
  maxPitches: number;
}

export function calculatePitchAvailability(
  ageGroup: string,
  outings: { outing_date: string; pitch_count: number; outing_type: string }[]
): PitchAvailability {
  const maxPitches = getMaxPitches(ageGroup);

  if (!outings || outings.length === 0) {
    return { status: 'green', label: 'Available', daysRemaining: 0, lastOuting: null, maxPitches };
  }

  // Sort by date descending to get most recent
  const sorted = [...outings].sort((a, b) => new Date(b.outing_date).getTime() - new Date(a.outing_date).getTime());
  const latest = sorted[0];
  const requiredRest = getRequiredRestDays(ageGroup, latest.pitch_count);

  // Reduce rest by 1 for bullpen or practice (minimum 0)
  const adjustedRest = (latest.outing_type === 'bullpen' || latest.outing_type === 'practice')
    ? Math.max(0, requiredRest - 1)
    : requiredRest;

  const outingDate = new Date(latest.outing_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  outingDate.setHours(0, 0, 0, 0);

  const daysSince = Math.floor((today.getTime() - outingDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, adjustedRest - daysSince);

  // Check 3 consecutive days rule
  const last3Days = sorted.filter(o => {
    const d = new Date(o.outing_date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 2;
  });
  const uniqueDays = new Set(last3Days.map(o => o.outing_date)).size;

  const lastOuting = {
    date: latest.outing_date,
    pitchCount: latest.pitch_count,
    outingType: latest.outing_type,
  };

  // 3 consecutive days = red regardless
  if (uniqueDays >= 3) {
    return { status: 'red', label: 'No Go — 3 consecutive days', daysRemaining: 1, lastOuting, maxPitches };
  }

  if (daysRemaining === 0) {
    return { status: 'green', label: 'Available', daysRemaining: 0, lastOuting, maxPitches };
  }

  if (daysRemaining === 1) {
    return { status: 'yellow', label: `Almost Ready — 1 day`, daysRemaining: 1, lastOuting, maxPitches };
  }

  return { status: 'red', label: `No Go — ${daysRemaining} days rest`, daysRemaining, lastOuting, maxPitches };
}
