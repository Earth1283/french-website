export function greetingFor(hour: number): { french: string; english: string } {
  if (hour >= 5 && hour < 12) return { french: 'Bonjour', english: 'Good morning' };
  if (hour >= 12 && hour < 18) return { french: 'Bon après-midi', english: 'Good afternoon' };
  return { french: 'Bonsoir', english: 'Good evening' };
}
