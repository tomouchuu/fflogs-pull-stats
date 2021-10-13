import FightDataType from '../types/fight-data'
import getFightTime from './getfighttime';

interface Reports {
  fights: FightDataType[]
}

let bestPhase = 0;
let bestFightPercentage = 0;
let bestBossHealth = 100;
let bestFightTime = 0;

function isBestTime(fight: FightDataType): boolean {
  if (fight.startTime && fight.endTime) {
    const fightTime = getFightTime(fight.startTime, fight.endTime);

    if (fightTime >= bestFightTime) {
      bestFightTime = fightTime;
      return true;
    }
  }

  return false;
}

function calculateBestPull(fight: FightDataType): boolean {
  if (fight.lastPhase > bestPhase) {
    // If we've gotten to a new phase set that to best and reset the boss health
    bestPhase = fight.lastPhase;
    bestBossHealth = 100;
    if (fight.startTime && fight.endTime) {
      isBestTime(fight);
    }
    return true;
  } else if (fight.lastPhase === bestPhase) {
    // Else if they are in the current best phase check the health is lower or equal OR account for TEA Phase 3
    if (fight.lastPhase === 3 && fight.bossPercentage === 0) {
      // For phase 3, we use the fightPercentage
      if (fight.fightPercentage >= bestFightPercentage) {
        bestFightPercentage = fight.fightPercentage;
        bestBossHealth = fight.fightPercentage;

        // Check if we do have times
        if (fight.startTime && fight.endTime) {
          // If we do work out if it's better or not
          return isBestTime(fight);
        } else {
          // Else we can just mark it as true
          return true;
        }

      } else {
        return isBestTime(fight);
      }
    } else if (fight.bossPercentage <= bestBossHealth) {
      // If they've done more or equal damage to the boss
      bestBossHealth = fight.bossPercentage;

      // Check if we do have times
      if (fight.startTime && fight.endTime) {
        // If we do work out if it's better or not
        return isBestTime(fight);
      } else {
        // Else we can just mark it as true
        return true;
      }

    } else {
      return isBestTime(fight);
    }
  } else {
    return isBestTime(fight);
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
