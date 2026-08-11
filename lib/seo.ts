import { SITE, STATION, TRACKS } from "@/lib/constants";

export const STATION_NAME = `${STATION.NAME} ${STATION.SUFFIX}`;

export const SEO = {
  TITLE: `${STATION_NAME} — Old Hindi Truck Driver Songs, Non-Stop`,
  DESCRIPTION:
    "A one-station radio for old Hindi songs — the Kishore Kumar highway classics and the " +
    "Kumar Sanu, Alka Yagnik and Udit Narayan hits that play on every truck and in every " +
    "saloon. No playlist to pick through: press play and drive.",
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
  ],
} as const;

/**
 * Structured data for the page.
 *
 * This is the part that carries real weight: the visible page is a player with
 * a couple of lines of text, so without it a crawler sees almost nothing. The
 * playlist below is the actual content, described accurately — every entry is
 * a track the station really plays.
 */
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
        genre: ["Bollywood", "Hindi film music", "Retro"],
      },
      {
        "@type": "MusicPlaylist",
        "@id": `${SITE.URL}/#playlist`,
        name: `${STATION_NAME} playlist`,
        description: SEO.DESCRIPTION,
        numTracks: TRACKS.length,
        track: TRACKS.map((entry) => ({
          "@type": "MusicRecording",
          name: entry.title,
          ...(entry.artist ? { byArtist: { "@type": "MusicGroup", name: entry.artist } } : {}),
          ...(entry.film ? { inAlbum: { "@type": "MusicAlbum", name: entry.film } } : {}),
          ...(entry.year ? { datePublished: String(entry.year) } : {}),
        })),
      },
    ],
  };
}
