import FightDataType from '../types/fight-data'

interface Reports {
  fights: FightDataType[]
}

let bestPhase = 0;
let bestFightPercentage = 0;
let bestBossHealth = 100;

function calculateBestPull(fight: FightDataType): boolean {
  if (fight.lastPhase > bestPhase) {
    // If we've gotten to a new phase set that to best and reset the boss health
    bestPhase = fight.lastPhase;
    bestBossHealth = 100;
    return true;
  } else if (fight.lastPhase === bestPhase) {
    // Else if they are in the current best phase check the health is lower or equal OR account for TEA Phase 3
    if (fight.lastPhase === 3 && fight.bossPercentage === 0) {
      // For phase 3, we use the fightPercentage
      if (fight.fightPercentage >= bestFightPercentage) {
        bestFightPercentage = fight.fightPercentage;
        bestBossHealth = fight.fightPercentage;
        return true;
      } else {
        return false;
      }
    } else if (fight.bossPercentage <= bestBossHealth) {
      // If they've done more or equal damage to the boss
      bestBossHealth = fight.bossPercentage;
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function getHistoricBestPull(reports: Reports[]): FightDataType | any {
  let longListOfPulls: FightDataType[] = [];
  reports.forEach((report: {fights: FightDataType[]}) => {
    longListOfPulls = longListOfPulls.concat(report.fights);
  });
  
  const bestPull = getBestPull(longListOfPulls);
  return bestPull;
}

export function getBestPull(pulls: FightDataType[]): FightDataType {
  let bestPull: FightDataType;

  const bestPulls = pulls.filter((fight: FightDataType) => {
    return calculateBestPull(fight);
  });

  if (bestPulls.length > 0) {
    bestPull = (bestPulls.pop() as FightDataType);
  } else {
    // There is an error
    bestPull = {
      bossPercentage: 100,
      fightPercentage: 0,
      lastPhase: 0,
      startTime: 0,
      endTime: 0
    };
  }

  return bestPull;
}

export default getHistoricBestPull;
