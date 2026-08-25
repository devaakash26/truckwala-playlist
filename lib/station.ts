import { STATIONS, STORAGE_KEYS } from "@/lib/constants";
import type { Station, StationId, Track } from "@/lib/types";

/** Where the dial sits before anyone has touched it. */
export const DEFAULT_STATION_ID: StationId = STATIONS[0].id;

export function getStation(stationId: StationId): Station {
  return STATIONS.find((station) => station.id === stationId) ?? STATIONS[0];
}

export function stationTracks(stationId: StationId): readonly Track[] {
  return getStation(stationId).tracks;
}

export function nextStationId(stationId: StationId): StationId {
  const at = STATIONS.findIndex((station) => station.id === stationId);
  return STATIONS[(at + 1) % STATIONS.length].id;
}

export function readStation(): StationId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.STATION);
    return STATIONS.some((station) => station.id === stored)
      ? (stored as StationId)
      : DEFAULT_STATION_ID;
  } catch {
    return DEFAULT_STATION_ID;
  }
}

export function writeStation(stationId: StationId): void {
  try {
    window.localStorage.setItem(STORAGE_KEYS.STATION, stationId);
  } catch {
  }
}
