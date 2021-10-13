import { useEffect, useState } from 'react'
import { gql } from '@urql/core'
import { useQuery } from 'urql'
import { getUnixTime, subDays } from 'date-fns'

import FightData from './components/fight-data'
import FightDataType from './types/fight-data'

import getHistoricBestPull from './utils/getbestpull'
import './App.css'

const getUserQuery = gql`
  query {
    rateLimitData {
      pointsSpentThisHour
      pointsResetIn
    }
    userData {
      currentUser {
        id
      }
    }
  }
`;

const getCurrentFightQuery = gql`
  query($userId: Int!) {
    reportData {
      reports(userID: $userId, limit: 1) {
        data {
          zone {
            id
            name
          }
          fights {
            encounterID
            name
          }
        }
      }
    }
  }
`;

const todayReportQuery = gql`
  query($userId: Int, $zoneId: Int, $encounterId: Int, $reportsFrom: Float) {
    reportData {
      reports(userID: $userId, zoneID: $zoneId, startTime: $reportsFrom, limit: 10) {
        data {
           fights(encounterID: $encounterId) {
            bossPercentage
            fightPercentage
            lastPhase
            startTime
            endTime
          } 
        }
      }
    }
  }
`;


const historicReportQuery = gql`
  query($userId: Int, $zoneId: Int, $encounterId: Int, $reportsFrom: Float, $reportsTo: Float) {
    reportData {
      reports(userID: $userId, zoneID: $zoneId, startTime: $reportsFrom, endTime: $reportsTo) {
        data {
           fights(encounterID: $encounterId) {
            bossPercentage
            fightPercentage
            lastPhase
          } 
        }
      }
    }
  }
`;

const BaseFight: FightDataType = {
  bossPercentage: 100,
  fightPercentage: 0,
  lastPhase: 0,
  startTime: 0,
  endTime: 0
}

function App() {
  const [zoneId, setZoneId] = useState(0)
  const [encounterId, setEncounterId] = useState(0)
  const [historicReportsFrom] = useState(import.meta.env.VITE_HISTORIC_START_DATE)
  const [todayReportsFrom] = useState(`${getUnixTime(subDays(new Date(), 1))}000`)

  const [bestToday, updateBestToday] = useState(BaseFight)
  const [pullsToday, updatePullsToday] = useState(0)
  const [bestTotal, updateBestTotal] = useState(BaseFight)
  const [totalPulls, updateTotalPulls] = useState(0)

  const [user] = useQuery({
    query: getUserQuery,
  });
  const {data: userData, fetching: userFetching} = user;
  const userId = userData?.userData?.currentUser?.id;

  const [zoneEncounterIds] = useQuery({
    query: getCurrentFightQuery,
    variables: {userId},
    pause: !userId
  });
  const { data: currentZoneEncounterIds, fetching: fetchingCurrentZoneEncounterIds } = zoneEncounterIds;

  const [todayReport, reexecuteTodayQuery] = useQuery({
    query: todayReportQuery,
    variables: {
      userId,
      zoneId,
      encounterId,
      reportsFrom: todayReportsFrom
    },
    pause: !userId || !zoneId || !encounterId
  });
  const { data: todayReportData, fetching, error } = todayReport;
  
  const [historicReports, reexecuteHistoricQuery] = useQuery({
    query: historicReportQuery,
    variables: {
      userId,
      zoneId,
      encounterId,
      reportsFrom: historicReportsFrom,
      reportsTo: todayReportsFrom
    },
    pause: !userId || !zoneId || !encounterId || !historicReportsFrom || !todayReportsFrom
  })
  const { data: historicReportData, fetching: historicFetching, error: historicError } = historicReports;

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Potentially updating');
      if (!fetching) {
        console.log('Recalling');
        reexecuteTodayQuery({ requestPolicy: 'network-only' });
      }
    }, (1000 * 60) * 2) // 2 mins
    // }, (1000 * 10)) // 10 seconds

    return () => clearInterval(timer);
  }, [fetching, reexecuteTodayQuery]);

  useEffect(() => {
    if (!fetchingCurrentZoneEncounterIds && currentZoneEncounterIds) {
      const firstReport = currentZoneEncounterIds.reportData.reports.data[0];

      console.log(`Setting zone and encounter ${firstReport.zone?.name} + ${firstReport.fights[0].name}`);

      setZoneId(firstReport.zone?.id);
      setEncounterId(firstReport.fights[0].encounterID)
    }
  }, [fetchingCurrentZoneEncounterIds]);

  useEffect(() => {
    if (!fetching && todayReportData) {
      console.log(`Getting today's reports for zone:${zoneId} and encounter:${encounterId}`);

      const todayReportsArr = todayReportData.reportData.reports.data;
      const bestPull = getHistoricBestPull(todayReportsArr);

      updateBestToday(bestPull);
    }
  }, [fetching, todayReportData]);

  useEffect(() => {
    if (!historicFetching && historicReportData) {
      console.log(`Getting historic reports for zone:${zoneId} and encounter:${encounterId}`);
      const historicDataArr = historicReportData.reportData.reports.data;
      const besteverPull = getHistoricBestPull(historicDataArr);
      updateBestTotal(besteverPull);
    }
  }, [historicFetching, historicReportData]);

  useEffect(() => {
    if (!fetching && todayReportData && historicReportData) {
      let totalTodayPulls = 0;
      const todayReportsArr = todayReportData.reportData.reports.data;
      todayReportsArr.forEach((report: {fights: Object[]}) => {
        totalTodayPulls = totalTodayPulls + report.fights.length;
      });
      
      let totalHistoricPulls = 0;
      const historicDataArr = historicReportData.reportData.reports.data;
      historicDataArr.forEach((report: {fights: Object[]}) => {
        totalHistoricPulls = totalHistoricPulls + report.fights.length;
      });

      updatePullsToday(totalTodayPulls);
      updateTotalPulls(totalHistoricPulls + totalTodayPulls);
    }
  }, [fetching, todayReportData, historicReportData]);

  if (fetching && historicFetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;
  if (historicError) return <p>Oh no... {historicError.message}</p>;

  if (bestToday.lastPhase >= 0 && bestToday.bossPercentage <= 100) {
    return (
      <div className="App">
        <main>
          <p>
            Best Today:&nbsp;
            <FightData bossPercentage={bestToday.bossPercentage} fightPercentage={bestToday.fightPercentage} lastPhase={bestToday.lastPhase} startTime={bestToday.startTime} endTime={bestToday.endTime} />
          </p>
          <p>Pulls Today: {pullsToday}</p>
          {
            bestTotal.lastPhase >= 0 && bestTotal.bossPercentage <= 100 && (
              <>
                <p>
                  Best All-Time:&nbsp;
                  <FightData bossPercentage={bestTotal.bossPercentage} fightPercentage={bestTotal.fightPercentage} lastPhase={bestTotal.lastPhase} />
                </p>
                <p>Total Pulls: {totalPulls}</p>
              </>
            )
          }
        </main>
      </div>
    )
  }

  return (
    <div className="App">
      <main>
        <p>Waiting for data...</p>
      </main>
    </div>
  )
}

export default App
