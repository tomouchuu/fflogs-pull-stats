import { useEffect, useState } from 'react';

import FightDataType from '../types/fight-data';
import { getFightTimeFormat } from '../utils/getfighttime';

function FightData({bossPercentage, fightPercentage, lastPhase, endTime, startTime}: FightDataType) {
  const [fightTime, setFightTime] = useState('');

  useEffect(() => {
    if (endTime && startTime) {
      setFightTime(` - ${getFightTimeFormat(startTime, endTime)}`);
    }
  }, [endTime, startTime]);

  return (
    <span>
      <br />
      {`${fightPercentage.toFixed(2)}% of fight`}<br />
      {`Boss at ${bossPercentage.toFixed(2)}% in P${lastPhase}${fightTime}`}<br />
    </span>
  );
}

export default FightData;
