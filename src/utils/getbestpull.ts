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

export function getTodayBestPull(reports: Reports[]): FightDataType | any {
  let longListOfPulls: FightDataType[] = [];
  reports.forEach((report: {fights: FightDataType[]}) => {
    longListOfPulls = longListOfPulls.concat(report.fights);
  });
  
  const bestPull = getBestPullToday(longListOfPulls);
  return bestPull;
}

export function getBestPullToday(pulls: FightDataType[]): FightDataType {
  let bestPullToday: FightDataType;

  const bestPulls = pulls.filter((fight: FightDataType) => {
    return calculateBestPull(fight);
  });

  if (bestPulls.length > 0) {
    bestPullToday = Object.assign(
      {}, (bestPulls.pop() as FightDataType)
    );
    bestPullToday.fightPercentage = 100 - bestPullToday.fightPercentage;
  } else {
    // There is an error
    bestPullToday = {
      bossPercentage: 100,
      fightPercentage: 0,
      lastPhase: 0,
      startTime: 0,
      endTime: 0
    };
  }

  return bestPullToday;
}

export default getTodayBestPull;
