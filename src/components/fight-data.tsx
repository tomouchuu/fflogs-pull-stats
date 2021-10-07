import {format} from 'date-fns';
import { useEffect, useState } from 'react';

import FightDataType from '../types/fight-data';

function FightData({bossPercentage, fightPercentage, lastPhase, endTime, startTime}: FightDataType) {
  const [fightTime, setFightTime] = useState('');
  const [percentThrough, setPercentThrough] = useState('');

  // TODO: Account for if the bossPercentage is 0 but stuff is happening, aka TEA Phase 3
  useEffect(() => {
    if (bossPercentage === undefined) {
      setPercentThrough(`0%`);
    } else if (bossPercentage === 0) {
      if (lastPhase === 3) {
        setPercentThrough(`${fightPercentage}%`);
      } else {
        setPercentThrough(`Enrage`);
      }
    } else {
      // Need to set bossPercentage to like a 2decimal point
      const setBossPercentage = 100 - bossPercentage;
      setPercentThrough(`${setBossPercentage.toFixed(2)}%`);
    }
  }, [bossPercentage, fightPercentage, lastPhase]);

  useEffect(() => {
    if (endTime && startTime) {
      setFightTime(` - ${format(endTime - startTime, 'm:ss')}`);
    }
  }, [endTime, startTime]);

  return (
    <span>{`${percentThrough} of P${lastPhase}${fightTime}`}</span>
  );
}

export default FightData;
