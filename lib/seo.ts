import { SITE, STATION, STATIONS } from "@/lib/constants";
import type { Track } from "@/lib/types";

export const STATION_NAME = `${STATION.NAME} ${STATION.SUFFIX}`;

export const SEO = {
  TITLE: `${STATION_NAME} — Old Hindi & Punjabi Truck Driver Songs, Non-Stop`,
  DESCRIPTION:
    "A two-band radio for old songs — the Kishore Kumar highway classics and the Kumar Sanu, " +
    "Alka Yagnik and Udit Narayan hits on one dial, and Chamkila, Surjit Bindrakhia, Jazzy B, " +
    "Babbu Maan, Diljit Dosanjh and Miss Pooja on the other. No playlist to pick through: " +
    "press play and drive.",
  KEYWORDS: [
    "old song",
    "old truck driver song",
    "hindi old song",
    "truck driver playlist",
    "saloon songs",
    "purane gaane",
    "old hindi songs radio",
    "90s bollywood songs",
    "Kishore Kumar",
    "Kumar Sanu",
    "Alka Yagnik",
    "Udit Narayan",
    "hindi retro radio",
    "highway songs",
    "old punjabi song",
    "purane punjabi geet",
    "punjabi truck driver songs",
    "Amar Singh Chamkila",
    "Surjit Bindrakhia",
    "Jazzy B",
    "Gippy Grewal",
    "Sharry Maan",
    "Babbu Maan",
    "Diljit Dosanjh",
    "Miss Pooja",
    "Geeta Zaildar",
  ],
} as const;

export function playlistJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.URL}/#website`,
        url: SITE.URL,
        name: STATION_NAME,
        description: SEO.DESCRIPTION,
        inLanguage: ["hi", "en"],
      },
      {
        "@type": "RadioStation",
        "@id": `${SITE.URL}/#station`,
        name: STATION_NAME,
        url: SITE.URL,
        slogan: STATION.TAGLINE,
        genre: ["Bollywood", "Hindi film music", "Punjabi folk", "Retro"],
      },
      // One playlist per band. Two bands is two bodies of content, and folding
      // them into a single list would describe a station that does not exist.
      ...STATIONS.map((station) => ({
        "@type": "MusicPlaylist",
        "@id": `${SITE.URL}/#playlist-${station.id}`,
        name: `${STATION_NAME} ${station.frequency} — ${station.name}`,
        numTracks: station.tracks.length,
        track: station.tracks.map((entry: Track) => ({
          "@type": "MusicRecording",
          name: entry.title,
          ...(entry.artist ? { byArtist: { "@type": "MusicGroup", name: entry.artist } } : {}),
          ...(entry.film ? { inAlbum: { "@type": "MusicAlbum", name: entry.film } } : {}),
          ...(entry.year ? { datePublished: String(entry.year) } : {}),
        })),
      })),
    ],
  };
}
