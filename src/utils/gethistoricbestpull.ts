import FightDataType from '../types/fight-data'
import getFightTime from './getfighttime';

interface Reports {
  fights: FightDataType[]
}

let bestPhase = 0;
let bestFightPercentage = 100;
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
  if (bestFightPercentage > fight.fightPercentage) {
    // If we've gotten further into the fight then use this information
    bestBossHealth = fight.bossPercentage;
    bestFightPercentage = fight.fightPercentage;
    bestPhase = fight.lastPhase;
    if (fight.startTime && fight.endTime) {
      isBestTime(fight);
    }
    return true;
  } else if (bestFightPercentage === fight.fightPercentage) {
    // Else if we got to the same place, consider boss percentage
    if (bestBossHealth > fight.bossPercentage) {
      bestBossHealth = fight.bossPercentage;
      if (fight.startTime && fight.endTime) {
        isBestTime(fight);
      }
      return true;
    }
    else {
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
