import {format} from 'date-fns';

export function getFightTime(startTime: number, endTime: number): number {
  return endTime - startTime;
}

export function getFightTimeFormat(startTime: number, endTime: number): string {
  return format(getFightTime(startTime, endTime), 'm:ss')
}

export default getFightTime;