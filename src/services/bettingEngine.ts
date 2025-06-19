// Professional betting engine with real market mechanics
export interface BetOdds {
  horseId: string;
  winOdds: number;
  placeOdds: number;
  showOdds: number;
  totalBetAmount: number;
}

export interface BetResult {
  bet: any;
  won: boolean;
  payout: number;
}

export class BettingEngine {
  private horseBets: Map<string, { win: number; place: number; show: number }> = new Map();
  private totalPool: number = 0;
  private houseEdge: number = 0.15; // 15% house edge

  constructor() {
    this.resetBets();
  }

  public calculateOdds(horses: any[]): BetOdds[] {
    return horses.map(horse => {
      const horseId = horse.id;
      const bets = this.horseBets.get(horseId) || { win: 0, place: 0, show: 0 };
      
      // Calculate win odds based on performance and betting volume
      const performanceScore = this.calculatePerformanceScore(horse);
      const bettingVolume = bets.win;
      const totalWinPool = Array.from(this.horseBets.values()).reduce((sum, b) => sum + b.win, 0);
      
      let winOdds: number;
      if (totalWinPool === 0) {
        // Base odds on performance only
        winOdds = Math.max(1.2, 10 - (performanceScore * 8));
      } else {
        // Market-driven odds
        const marketShare = bettingVolume / Math.max(totalWinPool, 1);
        const impliedProbability = Math.max(0.05, marketShare + (performanceScore * 0.3));
        winOdds = Math.max(1.1, (1 / impliedProbability) * (1 - this.houseEdge));
      }

      return {
        horseId,
        winOdds: Math.round(winOdds * 10) / 10,
        placeOdds: Math.round((winOdds * 0.6) * 10) / 10,
        showOdds: Math.round((winOdds * 0.4) * 10) / 10,
        totalBetAmount: bets.win + bets.place + bets.show
      };
    });
  }

  private calculatePerformanceScore(horse: any): number {
    const genetics = horse.genetics;
    const stats = horse.stats;
    
    // Genetic potential (0-1)
    const geneticScore = (
      genetics.baseSpeed * 0.4 +
      genetics.stamina * 0.3 +
      genetics.agility * 0.2 +
      genetics.intelligence * 0.1
    ) / 100;

    // Performance history (0-1)
    const winRate = stats.races > 0 ? stats.wins / stats.races : 0.5;
    const performanceScore = winRate * 0.7 + geneticScore * 0.3;

    return Math.max(0.1, Math.min(0.9, performanceScore));
  }

  public placeBet(horseId: string, betType: 'win' | 'place' | 'show', amount: number): boolean {
    if (amount <= 0) return false;

    if (!this.horseBets.has(horseId)) {
      this.horseBets.set(horseId, { win: 0, place: 0, show: 0 });
    }

    const bets = this.horseBets.get(horseId)!;
    bets[betType] += amount;
    this.totalPool += amount;

    return true;
  }

  public calculatePayouts(raceResults: any[]): BetResult[] {
    const results: BetResult[] = [];
    const winner = raceResults[0];
    const second = raceResults[1];
    const third = raceResults[2];

    // Process all bets (in a real app, this would come from a database)
    // For demo, we'll simulate some bets
    const mockBets = this.generateMockBets(raceResults);

    mockBets.forEach(bet => {
      const odds = this.calculateOdds(raceResults.map(r => ({ id: r.horseId, genetics: {}, stats: {} })));
      const horseOdds = odds.find(o => o.horseId === bet.horseId);
      
      if (!horseOdds) {
        results.push({ bet, won: false, payout: 0 });
        return;
      }

      let won = false;
      let payout = 0;

      switch (bet.type) {
        case 'Win':
          if (bet.horseId === winner.horseId) {
            won = true;
            payout = bet.amount * horseOdds.winOdds;
          }
          break;
        case 'Place':
          if (bet.horseId === winner.horseId || bet.horseId === second?.horseId) {
            won = true;
            payout = bet.amount * horseOdds.placeOdds;
          }
          break;
        case 'Show':
          if (bet.horseId === winner.horseId || bet.horseId === second?.horseId || bet.horseId === third?.horseId) {
            won = true;
            payout = bet.amount * horseOdds.showOdds;
          }
          break;
      }

      results.push({ bet, won, payout });
    });

    return results;
  }

  private generateMockBets(raceResults: any[]): any[] {
    // Generate some realistic betting patterns for demo
    return [
      { id: '1', horseId: raceResults[0]?.horseId, type: 'Win', amount: 500 },
      { id: '2', horseId: raceResults[1]?.horseId, type: 'Place', amount: 300 },
      { id: '3', horseId: raceResults[2]?.horseId, type: 'Show', amount: 200 },
    ];
  }

  public resetBets(): void {
    this.horseBets.clear();
    this.totalPool = 0;
  }

  public getTotalPool(): number {
    return this.totalPool;
  }
}