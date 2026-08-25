import type { Phase, Station, Track } from "@/lib/types";

export const STATION = {
  NAME: "TRUCKWALA",
  SUFFIX: "FM",
  FREQUENCY: "93.5",
  TAGLINE: "Horn OK Please",
} as const;

export const SITE = {
  URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://oldtruckwala.vercel.app",
  LOCALE: "en_IN",
} as const;

/**
 * Ordered ascending by `startHour`. The last entry wraps past midnight, so any
 * hour below the first boundary resolves back to it. Keep this sorted — the
 * runtime resolver and the pre-paint boot script are both generated from it.
 */
export const PHASES: readonly Phase[] = [
  {
    id: "dawn",
    label: "Bhor",
    startHour: 5,
    clip: "/scenes/dawn.mp4",
    poster: "/scenes/dawn.jpg",
  },
  {
    id: "day",
    label: "Dopahar",
    startHour: 8,
    clip: "/scenes/day.mp4",
    poster: "/scenes/day.jpg",
  },
  {
    id: "dusk",
    label: "Shaam",
    startHour: 17,
    clip: "/scenes/dusk.mp4",
    poster: "/scenes/dusk.jpg",
  },
  {
    id: "night",
    label: "Raat",
    startHour: 20,
    clip: "/scenes/night.mp4",
    poster: "/scenes/night.jpg",
  },
];

export const DEFAULT_PHASE_ID = PHASES[PHASES.length - 1].id;

const HINDI_TRACKS: readonly Track[] = [
  {
    id: "tumsa-koi-pyaara",
    title: "Tumsa Koi Pyaara",
    artist: "Kumar Sanu & Alka Yagnik",
    film: "Khuddar",
    year: 1994,
    source: "3NWMK2MRqIk",
  },
  {
    id: "tumhein-apna-banane-ki-kasam",
    title: "Tumhein Apna Banane Ki Kasam",
    artist: "Anuradha Paudwal & Kumar Sanu",
    film: "Sadak",
    year: 1991,
    source: "tPNwGuu_rQ4",
  },
  {
    id: "tumse-milne-ko-dil",
    title: "Tumse Milne Ko Dil",
    artist: "Alka Yagnik & Kumar Sanu",
    film: "Phool Aur Kaante",
    year: 1991,
    source: "5y_TCKNzAMI",
  },
  {
    id: "saaton-janam",
    title: "Saaton Janam Main Tere",
    artist: "Kumar Sanu & Alka Yagnik",
    film: "Dilwale",
    year: 1994,
    source: "oFxbBeYhLqM",
  },
  {
    id: "gaadi-bula-rahi-hai",
    title: "Gaadi Bula Rahi Hai",
    artist: "Kishore Kumar",
    film: "Dost",
    year: 1974,
    source: "3V8Y8GGnLvk",
  },
  {
    id: "kitna-haseen-chehra",
    title: "Kitna Haseen Chehra",
    artist: "Kumar Sanu",
    film: "Dilwale",
    year: 1994,
    source: "qGOTe3KmCdY",
  },
  {
    id: "ye-kaali-kaali-aankhen",
    title: "Ye Kaali Kaali Aankhen",
    artist: "Kumar Sanu & Anu Malik",
    film: "Baazigar",
    year: 1993,
    source: "acluPXcAsa0",
  },
  {
    id: "mujhse-mohabbat",
    title: "Mujhse Mohabbat Ka Izhaar Karti",
    artist: "Kumar Sanu & Alka Yagnik",
    film: "Hum Hain Rahi Pyar Ke",
    year: 1993,
    source: "NwTTV_k656Q",
  },
  {
    id: "musafir-hoon-yaaron",
    title: "Musafir Hoon Yaaron",
    artist: "Kishore Kumar",
    film: "Parichay",
    year: 1972,
    source: "1DwROkoAAcI",
  },
  {
    id: "tere-dard-se-dil",
    title: "Tere Dard Se Dil",
    artist: "Kumar Sanu",
    film: "Deewana",
    year: 1992,
    source: "TgHYW8ubFko",
  },
  {
    id: "dekha-hai-pehli-baar",
    title: "Dekha Hai Pehli Baar",
    artist: "Alka Yagnik & S. P. Balasubrahmanyam",
    film: "Saajan",
    year: 1991,
    source: "WAgJ8KM5AVQ",
  },
  {
    id: "ab-tere-bin",
    title: "Ab Tere Bin Jee Lenge Hum",
    artist: "Kumar Sanu",
    film: "Aashiqui",
    year: 1990,
    source: "tUx-PDUKne8",
  },
  {
    id: "zindagi-ka-safar",
    title: "Zindagi Ka Safar",
    artist: "Kishore Kumar",
    film: "Safar",
    year: 1970,
    source: "mA1CM_UpLss",
  },
  {
    id: "main-duniya-bhula-doonga",
    title: "Main Duniya Bhula Doonga",
    artist: "Anuradha Paudwal & Kumar Sanu",
    film: "Aashiqui",
    year: 1990,
    source: "otQmzlm-s7Q",
  },
  {
    id: "pehla-nasha",
    title: "Pehla Nasha",
    artist: "Udit Narayan & Sadhana Sargam",
    film: "Jo Jeeta Wohi Sikandar",
    year: 1992,
    source: "ZYotlBxpM3Q",
  },
  {
    id: "jeeta-tha-jiske-liye",
    title: "Jeeta Tha Jiske Liye",
    artist: "Kumar Sanu & Alka Yagnik",
    film: "Dilwale",
    year: 1994,
    source: "CTuvMubzXpU",
  },
  {
    id: "chala-jata-hoon",
    title: "Chala Jata Hoon",
    artist: "Kishore Kumar",
    film: "Mere Jeevan Saathi",
    year: 1972,
    source: "UNjhqT_hlbg",
  },
  {
    id: "chalte-chalte",
    title: "Chalte Chalte Mere Yeh Geet",
    artist: "Kishore Kumar",
    film: "Chalte Chalte",
    year: 1976,
    source: "bQkRBvIBkeo",
  },
  {
    id: "ek-ladki-ko-dekha",
    title: "Ek Ladki Ko Dekha",
    artist: "Kumar Sanu",
    film: "1942: A Love Story",
    year: 1994,
    source: "htMvfOfixuM",
  },
  {
    id: "kuch-kuch-hota-hai",
    title: "Kuch Kuch Hota Hai",
    artist: "Udit Narayan & Alka Yagnik",
    film: "Kuch Kuch Hota Hai",
    year: 1998,
    source: "1QdbY4hEubw",
  },
  {
    id: "o-saathi-re",
    title: "O Saathi Re",
    artist: "Kishore Kumar",
    film: "Muqaddar Ka Sikandar",
    year: 1978,
    source: "Je1zop7EEUE",
  },
  {
    id: "achha-sila-diya",
    title: "Achha Sila Diya Toone",
    film: "Bewafa Sanam",
    year: 1995,
    source: "G7AdjVDBLO8",
  },
  {
    id: "woh-meri-neend",
    title: "Woh Meri Neend Mera Chain",
    artist: "Sadhana Sargam",
    film: "Hum Hain Rahi Pyar Ke",
    year: 1993,
    source: "bga_0ziOOfQ",
  },
  {
    id: "chura-ke-dil-mera",
    title: "Chura Ke Dil Mera",
    artist: "Kumar Sanu & Alka Yagnik",
    film: "Main Khiladi Tu Anari",
    year: 1994,
    source: "tPGacEQeBjQ",
  },
  {
    id: "ek-ajnabee-haseena-se",
    title: "Ek Ajnabee Haseena Se",
    artist: "Kishore Kumar",
    film: "Ajnabee",
    year: 1974,
    source: "0HqHruwzusM",
  },
  {
    id: "tu-meri-zindagi-hai",
    title: "Tu Meri Zindagi Hai",
    artist: "Anuradha Paudwal & Kumar Sanu",
    film: "Aashiqui",
    year: 1990,
    source: "oEg_iXEWlt4",
  },
  {
    id: "raah-mein-unse",
    title: "Raah Mein Unse Mulaqat",
    artist: "Kumar Sanu & Alka Yagnik",
    film: "Vijaypath",
    year: 1994,
    source: "dDR4oiyjUBA",
  },
  {
    id: "tujhe-dekha-to",
    title: "Tujhe Dekha To",
    film: "Dilwale Dulhania Le Jayenge",
    year: 1995,
    source: "H0_dJqZLugE",
  },
  {
    id: "diye-jalte-hain",
    title: "Diye Jalte Hain",
    artist: "Kishore Kumar",
    film: "Namak Haraam",
    year: 1973,
    source: "Wqpxj9lj9T4",
  },
  {
    id: "chhupana-bhi-nahin-aata",
    title: "Chhupana Bhi Nahin Aata",
    film: "Baazigar",
    year: 1993,
    source: "fg9G1dacXjk",
  },
  {
    id: "nahin-yeh-ho-nahin-sakta",
    title: "Nahin Yeh Ho Nahin Sakta",
    artist: "Kumar Sanu & Sadhana Sargam",
    film: "Barsaat",
    year: 1995,
    source: "RjJxWRFfG3s",
  },
  {
    id: "chingari-koi-bhadke",
    title: "Chingari Koi Bhadke",
    artist: "Kishore Kumar",
    film: "Amar Prem",
    year: 1972,
    source: "lzIXhfcgUWI",
  },
  {
    id: "tere-dar-par-sanam",
    title: "Tere Dar Par Sanam",
    artist: "Kumar Sanu",
    film: "Phir Teri Kahani Yaad Aayee",
    year: 1993,
    source: "5dWbn_qER3s",
  },
  {
    id: "ruk-jana-nahin",
    title: "Ruk Jana Nahin",
    artist: "Kishore Kumar",
    film: "Imtihan",
    year: 1974,
    source: "LvVIz1pkQ1k",
  },
  {
    id: "maine-pyar-tumhi-se-kiya",
    title: "Maine Pyar Tumhi Se Kiya Hai",
    artist: "Anuradha Paudwal & Kumar Sanu",
    film: "Phool Aur Kaante",
    year: 1991,
    source: "-N-k56i7M2k",
  },
  {
    id: "tum-to-thehre-pardesi",
    title: "Tum To Thehre Pardesi",
    artist: "Altaf Raja",
    year: 1997,
    source: "lRBIcaSV-Ns",
  },
  {
    id: "sochenge-tumhe-pyar",
    title: "Sochenge Tumhe Pyar",
    artist: "Kumar Sanu",
    film: "Deewana",
    year: 1992,
    source: "Ni3eKfV2BeE",
  },
  {
    id: "pal-pal-dil-ke-paas",
    title: "Pal Pal Dil Ke Paas",
    artist: "Kishore Kumar",
    film: "Blackmail",
    year: 1973,
    source: "QwLQ4_gkvsE",
  },
  {
    id: "chehra-kya-dekhte-ho",
    title: "Chehra Kya Dekhte Ho",
    artist: "Asha Bhosle & Kumar Sanu",
    film: "Salaami",
    year: 1994,
    source: "9v2bq2JHt4I",
  },
  {
    id: "is-tarah-aashiqui-ka",
    title: "Is Tarah Aashiqui Ka",
    artist: "Kumar Sanu",
    film: "Imtihan",
    year: 1994,
    source: "Y-o8NQ8Y36A",
  },
  {
    id: "kahin-mujhe-pyar-hua",
    title: "Kahin Mujhe Pyar Hua Toh Nahin",
    artist: "Alka Yagnik & Kumar Sanu",
    film: "Rang",
    year: 1993,
    source: "2nypvYilIkA",
  },
  {
    id: "pehli-pehli-baar",
    title: "Pehli Pehli Baar Mohabbat Ki Hai",
    film: "Sirf Tum",
    year: 1999,
    source: "cBGDDBHN22U",
  },
  {
    id: "chand-chupa-badal-mein",
    title: "Chand Chupa Badal Mein",
    artist: "Udit Narayan & Alka Yagnik",
    film: "Hum Dil De Chuke Sanam",
    year: 1999,
    source: "RcODRM8J_L0",
  },
  {
    id: "tune-dil-mera-toda",
    title: "Tune Dil Mera Toda",
    film: "Sanam Bewafa",
    year: 1991,
    source: "nG85YFR3o6U",
  },
  {
    id: "sab-kuchh-bhula-diya",
    title: "Sab Kuchh Bhula Diya",
    artist: "Sonu Nigam & Sapna Awasthi",
    film: "Hum Tumhare Hain Sanam",
    year: 2002,
    source: "xKx_80QM2LU",
  },
  {
    id: "aitbaar-nahi-karna",
    title: "Aitbaar Nahi Karna",
    artist: "Abhijeet & Sadhana Sargam",
    film: "Qayamat",
    year: 2003,
    source: "HoMSu1iw0Zw",
  },
  {
    id: "dil-ka-aalam",
    title: "Dil Ka Aalam",
    film: "Aashiqui",
    year: 1990,
    source: "BaAoZA0fup0",
  },
];

/* -------------------------------------------------------------------------- */
/* The Punjabi band                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Grouped by singer below, and deliberately not played that way — see `deal`.
 * `film` and `year` appear only where the label's own upload states them; on a
 * playlist this old, a missing credit beats a confident wrong one.
 */

/** Amar Singh Chamkila — the akhaara recordings, one song per upload. */
const CHAMKILA: readonly Track[] = [
  {
    id: "pehle-lalkare-naal",
    title: "Pehle Lalkare Naal",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "0MMvZ6j2mxc",
  },
  {
    id: "gora-gora-rang",
    title: "Gora Gora Rang",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "IdCZ-tZNrl0",
  },
  {
    id: "gaddi-te-likha-le",
    title: "Gaddi Te Likha Le Mera Naa",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "L8Ug596f92k",
  },
  {
    id: "aaj-chakka-jam-karata",
    title: "Aaj Chakka Jam Karata",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "29eaPdoN6j4",
  },
  {
    id: "laija-kithe-door",
    title: "Laija Kithe Door",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "ozV0df8BYOw",
  },
  {
    id: "theke-te-baitha-rehanda",
    title: "Theke Te Baitha Rehanda",
    artist: "Amar Singh Chamkila & Surinder Sonia",
    source: "2M00lRnmN3E",
  },
  {
    id: "kurti-sat-rang-di",
    title: "Kurti Sat Rang Di",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "8islsVeYi2k",
  },
  {
    id: "kal-bhaven-jind-kadh-layen",
    title: "Kal Bhaven Jind Kadh Layen",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "Egd6__JBByM",
  },
  {
    id: "kan-kar-gal-sun-makhna",
    title: "Kan Kar Gal Sun Makhna",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "83oaztNnR30",
  },
  {
    id: "lal-pari",
    title: "Lal Pari",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "WkMDjInY4Tg",
  },
  {
    id: "chaska-pe-geya",
    title: "Chaska Pe Geya",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "FhoNMrG_Alc",
  },
  {
    id: "sade-pind-da-riwaj-niara",
    title: "Sade Pind Da Riwaj Niara",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "zPmRv2k0W_0",
  },
  {
    id: "do-koh-to-purje",
    title: "Do Koh To Purje",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "TGuOX2PAKRA",
  },
  {
    id: "sharbat-wango-ghut-bhar-lai",
    title: "Sharbat Wango Ghut Bhar Lai",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "hwiIw6psjvQ",
  },
  {
    id: "bahan-wich-bhabi",
    title: "Bahan Wich Bhabi",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "0_8Lesv7CFs",
  },
  {
    id: "kach-de-glass-wich",
    title: "Kach De Glass Wich",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "WuO8LXdD7dg",
  },
  {
    id: "kar-yaad-kurhe",
    title: "Kar Yaad Kurhe",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "ZjFuJO7HJYc",
  },
  {
    id: "gabroo-ho-len-de",
    title: "Gabroo Ho Len De",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "n2T9zPzt05o",
  },
  {
    id: "chak-doon-ghade-ton",
    title: "Chak Doon Ghade Ton",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "pJAEc4ZxwAY",
  },
  {
    id: "main-sarab-ban-gayi",
    title: "Main Sarab Ban Gayi",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "wq8OtolIpTQ",
  },
  {
    id: "amli-de-larh-lake",
    title: "Amli De Larh Lake",
    artist: "Amar Singh Chamkila & Amarjot",
    source: "8SOfk6bZKuA",
  },
];

/** Surjit Bindrakhia — the hek every Punjabi wedding still runs on. */
const BINDRAKHIA: readonly Track[] = [
  {
    id: "jatt-di-pasand",
    title: "Jatt Di Pasand",
    artist: "Surjit Bindrakhia",
    source: "u43CZhZgGJk",
  },
  {
    id: "mukhda-dekh-ke",
    title: "Mukhda Dekh Ke",
    artist: "Surjit Bindrakhia",
    source: "6zj1LDUuOq8",
  },
  {
    id: "tera-yaar-bolda",
    title: "Tera Yaar Bolda",
    artist: "Surjit Bindrakhia",
    source: "tGiJSnwBwDQ",
  },
  {
    id: "dupatta-tera-satrang-da",
    title: "Dupatta Tera Satrang Da",
    artist: "Surjit Bindrakhia",
    source: "jjcNS8aKU1A",
  },
  {
    id: "lakk-tunoo-tunoo",
    title: "Lakk Tunoo Tunoo",
    artist: "Surjit Bindrakhia",
    source: "TvyAUmw5c6E",
  },
  {
    id: "latoo-deor-de-chubare-te",
    title: "Latoo Deor De Chubare Te",
    artist: "Surjit Bindrakhia",
    source: "I4uf3F8xmFA",
  },
];

/** Sharry Maan — including the one that is actually about a truck. */
/** Sharry Maan, including the one that is actually about a truck. */
const SHARRY_MAAN: readonly Track[] = [
  {
    id: "hostel",
    title: "Hostel",
    artist: "Sharry Maan",
    source: "IuO6uUXBJfE",
  },
  {
    id: "yaar-anmulle",
    title: "Yaar Anmulle",
    artist: "Sharry Maan",
    source: "iiQmg8Sldu8",
  },
  {
    id: "3-peg",
    title: "3 Peg",
    artist: "Sharry Maan",
    year: 2016,
    source: "fS2RIAMlKwA",
  },
  {
    id: "munda-bhal-di",
    title: "Munda Bhal Di",
    artist: "Sharry Maan",
    source: "wBlTNeuHOUs",
  },
  {
    id: "transportiye",
    title: "Transportiye",
    artist: "Sharry Maan",
    source: "E4A0I34f94s",
  },
  {
    id: "naukar",
    title: "Naukar",
    artist: "Sharry Maan",
    year: 2019,
    source: "uiicyJyjKAs",
  },
  {
    id: "hawa-de-bulle",
    title: "Hawa De Bulle",
    artist: "Sharry Maan",
    source: "AQXS9q94cCA",
  },
];

/** Gippy Grewal, back when he was still a singer with a film or two. */
/** Gippy Grewal, back when he was still a singer with a film or two. */
const GIPPY_GREWAL: readonly Track[] = [
  {
    id: "phulkari",
    title: "Phulkari",
    artist: "Gippy Grewal",
    film: "De De Gehra",
    source: "Ti2pfgm6uos",
  },
  {
    id: "supna",
    title: "Supna",
    artist: "Gippy Grewal",
    film: "Jihne Mera Dil Luteya",
    year: 2011,
    source: "Hj3LHCr4ieA",
  },
  {
    id: "angreji-beat",
    title: "Angreji Beat",
    artist: "Gippy Grewal & Yo Yo Honey Singh",
    source: "wSOnIVKh6gU",
  },
  {
    id: "mulhajedaariyan",
    title: "Mulhajedaariyan",
    artist: "Gippy Grewal",
    year: 2012,
    source: "Auw1qxPl1Qc",
  },
  {
    id: "ghar-di-sharab",
    title: "Ghar Di Sharab",
    artist: "Gippy Grewal",
    film: "Bhaji In Problem",
    year: 2013,
    source: "q5l554xTU4U",
  },
];

/** Bhupinder Gill — Battua, and the other one with Miss Neelam. */
const BHUPINDER_GILL: readonly Track[] = [
  {
    id: "battua",
    title: "Battua",
    artist: "Bhupinder Gill",
    source: "sHrO5ep81Do",
  },
  {
    id: "chan-chan",
    title: "Chan Chan",
    artist: "Bhupinder Gill & Miss Neelam",
    film: "De De Gehra",
    source: "ffClNLKNUSA",
  },
];

/** Jazzy B and Sukshinder Shinda — Punjabi folk through a UK bassbin. */
const JAZZY_B: readonly Track[] = [
  {
    id: "naag",
    title: "Naag",
    artist: "Jazzy B & Sukshinder Shinda",
    source: "BQXZfv1fnA4",
  },
  {
    id: "jawani",
    title: "Jawani",
    artist: "Jazzy B & Sukshinder Shinda",
    source: "brKedlb8_rs",
  },
  {
    id: "tera-roop",
    title: "Tera Roop",
    artist: "Jazzy B & Sukshinder Shinda",
    source: "D1MTweQHKrw",
  },
  {
    id: "soorma",
    title: "Soorma",
    artist: "Jazzy B & Sukshinder Shinda",
    source: "UL03D6bLryw",
  },
  {
    id: "dil-lutiya",
    title: "Dil Lutiya",
    artist: "Jazzy B & Apache Indian",
    source: "TI7RQO2cuh0",
  },
  {
    id: "bach-ke",
    title: "Bach Ke",
    artist: "Jazzy B & Sukshinder Shinda",
    source: "ZIOUDeKQyns",
  },
  {
    id: "chug-de-punjabi",
    title: "Chug De Punjabi",
    artist: "Jazzy B",
    film: "Teesri Aankh",
    source: "BzbrqigAXU0",
  },
];

/** Babbu Maan. */
const BABBU_MAAN: readonly Track[] = [
  {
    id: "mitran-nu-shounk-hathiyaran-da",
    title: "Mitran Nu Shounk Hathiyaran Da",
    artist: "Babbu Maan",
    source: "QbPjWxNnLQk",
  },
  {
    id: "saun-di-jhadi",
    title: "Saun Di Jhadi",
    artist: "Babbu Maan",
    film: "Saun Di Jhadi",
    source: "Iv7ls3mzPOU",
  },
  {
    id: "kabza",
    title: "Kabza",
    artist: "Babbu Maan",
    film: "Saun Di Jhadi",
    source: "w5dELB2O15E",
  },
  {
    id: "mitran-di-chatri",
    title: "Mitran Di Chatri",
    artist: "Babbu Maan",
    film: "Pyaas",
    source: "fpnJPH5t79Y",
  },
  {
    id: "laarian-de-naal",
    title: "Laarian De Naal",
    artist: "Babbu Maan",
    film: "Pyaas",
    source: "jZWF3BZwVCY",
  },
  {
    id: "bhangra-paun-de",
    title: "Bhangra Paun De",
    artist: "Babbu Maan",
    film: "Hashar",
    source: "3LqRdCHAsMg",
  },
];

/** Diljit Dosanjh, before the stadiums. */
const DILJIT: readonly Track[] = [
  {
    id: "5-taara",
    title: "5 Taara",
    artist: "Diljit Dosanjh",
    year: 2015,
    source: "uSKinFh8DTo",
  },
  {
    id: "lak-28-kudi-da",
    title: "Lak 28 Kudi Da",
    artist: "Diljit Dosanjh & Yo Yo Honey Singh",
    source: "LUXrfuOugnA",
  },
  {
    id: "buggi",
    title: "Buggi",
    artist: "Diljit Dosanjh",
    film: "Jatt & Juliet 2",
    year: 2013,
    source: "uzIyI82awsc",
  },
  {
    id: "main-fan-bhagat-singh-da",
    title: "Main Fan Bhagat Singh Da",
    artist: "Diljit Dosanjh",
    film: "Bikkar Bai Senti Mental",
    source: "gDE0SLOw-OI",
  },
];

/** Geeta Zaildar. */
const GEETA_ZAILDAR: readonly Track[] = [
  {
    id: "chak-chak-ke",
    title: "Chak Chak Ke",
    artist: "Geeta Zaildar & Aman Hayer",
    source: "7lN9KmB4hxo",
  },
  {
    id: "pegg",
    title: "Pegg",
    artist: "Geeta Zaildar",
    source: "_xaMGJXFgqE",
  },
  {
    id: "wrong-decision",
    title: "Wrong Decision",
    artist: "Geeta Zaildar & Gurlej Akhtar",
    source: "5UmuxuBNWtc",
  },
  {
    id: "blackia",
    title: "Blackia",
    artist: "Geeta Zaildar & Gurlej Akhtar",
    source: "VcrDgF79uOs",
  },
  {
    id: "billo-thumka-laga",
    title: "Billo Thumka Laga",
    artist: "Geeta Zaildar",
    source: "vuWuUxhvz34",
  },
];

/**
 * The requests.
 *
 * These lead the band, in the order they were asked for, and they sit out the
 * deal below — an order someone chose by hand is not ours to shuffle.
 */
const REQUESTS: readonly Track[] = [
  {
    id: "gaddi-shokeen-jatt-di",
    title: "Gaddi Shokeen Jatt Di",
    artist: "Pamma & Meenakshi",
    source: "25std5coxds",
  },
  {
    id: "jatt-saari-umar",
    title: "Jatt Saari Umar",
    artist: "Sippy Gill",
    film: "Jatt Kuwara",
    source: "mqu56IAB90A",
  },
  {
    id: "yaari-da-vasta",
    title: "Yaari Da Vasta",
    artist: "Sharry Maan",
    source: "B63ogQKn31c",
  },
  {
    id: "yankne",
    title: "Yankne",
    artist: "Sharry Maan",
    source: "MzXls-n5yNg",
  },
  {
    id: "lancer",
    title: "Lancer",
    artist: "Jassi Gill",
    film: "Bachmate 2",
    source: "S9UwtIKlGVI",
  },
  {
    id: "ikk-munda",
    title: "Ikk Munda",
    artist: "Sheera Jasvir",
    source: "zqu0Q-ur5g4",
  },
  {
    id: "seeti-maar-ke",
    title: "Seeti Maar Ke",
    artist: "Miss Pooja & Gagandeep",
    source: "hPgXj4mu6Fo",
  },
  {
    id: "chandigarh-waliye",
    title: "Chandigarh Waliye",
    artist: "Sharry Maan",
    film: "Aate Di Chiri",
    source: "LLn4MIJfjVk",
  },
  {
    id: "bapu-zimidar",
    title: "Bapu Zimidar",
    artist: "Jassie Gill",
    source: "7KYw3Gs2zUM",
  },
  {
    id: "time-table",
    title: "Time Table",
    artist: "Kulwinder Billa",
    source: "6tpLUszWs9M",
  },
  {
    id: "time-table-2",
    title: "Time Table 2",
    artist: "Kulwinder Billa",
    year: 2015,
    source: "ZFybffBA8Oc",
  },
  {
    id: "farishtay",
    title: "Farishtay",
    artist: "Wazir Patar & Mitika Kanwar",
    source: "qtj_mZ-Ijtk",
  },
  {
    id: "alrhaan-kuaariaan",
    title: "Alrhaan Kuaariaan",
    artist: "Diljit Dosanjh",
    film: "Smile",
    source: "GrPQlFU2S7I",
  },
  {
    id: "dildarian",
    title: "Dildarian",
    artist: "Amrinder Gill",
    source: "MDwgUE-TBVY",
  },
  {
    id: "apa-fer-milaange",
    title: "Apa Fer Milaange",
    artist: "Savi Kahlon",
    source: "7uyvNBmL7d4",
  },
  {
    id: "sanu-nehar-wale-pul",
    title: "Sanu Nehar Wale Pul Te Bula Ke",
    artist: "Noor Jehan",
    source: "ApC2TxFdoZE",
  },
  {
    id: "armani",
    title: "Armani",
    artist: "Harman Chahal",
    year: 2013,
    source: "XUh2KNntjD0",
  },
  {
    id: "sohne-mukhde-da",
    title: "Sohne Mukhde Da",
    artist: "Sharry Maan",
    film: "Aate Di Chiri",
    source: "lKB2AoDopM4",
  },
  {
    id: "rang-sanwla",
    title: "Rang Sanwla",
    artist: "Aarsh Benipal",
    year: 2016,
    source: "5gOPFW8F78E",
  },
];

/**
 * Deals the singers out instead of playing them in blocks.
 *
 * The runs above are grouped by singer because that is how a playlist is read
 * and edited. Played in that order the station would be twenty-one Chamkila
 * songs and then everybody else, which is the one thing a radio must not do.
 * So they are dealt into a single rotation: each singer's songs are notionally
 * spread across the whole playlist by share — hold a third of it and you come
 * round every third track — and each slot goes to whoever is most overdue,
 * skipping whoever just played. Spreading by share rather than by turn is what
 * keeps the deepest catalogue from clumping at the front without burying the
 * shallowest at the back.
 *
 * Deterministic on purpose: `Math.random` here would deal one order on the
 * server and another on the client, and hydration would tear.
 */
function deal(runs: ReadonlyArray<readonly Track[]>): readonly Track[] {
  const total = runs.reduce((sum, run) => sum + run.length, 0);
  const played = runs.map(() => 0);
  const order: Track[] = [];
  let last = -1;

  while (order.length < total) {
    const open = runs.filter((run, at) => played[at] < run.length).length;

    let pick = -1;
    let soonest = Infinity;
    for (let at = 0; at < runs.length; at++) {
      if (played[at] === runs[at].length) continue;
      if (at === last && open > 1) continue;
      const due = ((played[at] + 0.5) * total) / runs[at].length;
      if (due < soonest) {
        soonest = due;
        pick = at;
      }
    }

    order.push(runs[pick][played[pick]++]);
    last = pick;
  }

  return order;
}

const PUNJABI_TRACKS: readonly Track[] = [
  ...REQUESTS,
  ...deal([
    CHAMKILA,
    BINDRAKHIA,
    SHARRY_MAAN,
    GIPPY_GREWAL,
    BHUPINDER_GILL,
    JAZZY_B,
    BABBU_MAAN,
    DILJIT,
    GEETA_ZAILDAR,
  ]),
];

/**
 * The dial. Two bands, and the switch on the deck moves between them — the
 * frequency in the callsign is the one thing on the page that says which.
 */
export const STATIONS: readonly Station[] = [
  {
    id: "hindi",
    labels: ["Hindi", "हिंदी"],
    name: "Hindi",
    frequency: "93.5",
    tracks: HINDI_TRACKS,
  },
  {
    id: "punjabi",
    labels: ["Punjabi", "ਪੰਜਾਬੀ"],
    name: "Punjabi",
    frequency: "95.7",
    tracks: PUNJABI_TRACKS,
  },
];

export const TAILGATE = {
  SLOGAN: ["सावधानी हटी", "सब्ज़ी-पूड़ी बंटी"],
  FLANK: ["लोन भरना बाकी है", "थोड़ा दूरी बनाये रखे"],
} as const;

export const SHAYARI: ReadonlyArray<readonly string[]> = [
  ["बुरी नज़र वाले", "तेरा मुँह काला"],
  ["देखो मगर प्यार से"],
  ["धीरे चल प्यारे", "जीवन अनमोल है"],
  ["दम है तो क्रॉस कर", "नहीं तो बर्दाश्त कर"],
  ["मालिक की गाड़ी", "ड्राइवर का पसीना"],
  ["धीरे चलोगे तो बार-बार मिलोगे", "तेज़ चलोगे तो हरिद्वार मिलोगे"],
  ["ओके टाटा", "फिर मिलेंगे"],
  ["मैं भी बड़ा होकर", "ट्रक बनूँगा"],
  ["सर कटा सकते हैं", "लेकिन सर झुका सकते नहीं"],
  ["गंगा तेरा पानी अमृत"],
  ["जय माता दी"],
];

export const PLAYER = {
  /** How far ⏪ / ⏩ jump. */
  SEEK_STEP_SECONDS: 10,
  /** Press ⏮ past this point and it restarts the track instead of going back. */
  RESTART_THRESHOLD_SECONDS: 3,
  /** Seek-bar refresh rate. Only the progress subtree re-renders on a tick. */
  PROGRESS_TICK_MS: 250,
  VOLUME_STEP: 5,
  DEFAULT_VOLUME: 80,
  /** Grace period before auto-skipping a track YouTube refused to serve. */
  ERROR_SKIP_DELAY_MS: 1500,
  /** One turn of the disc. */
  DISC_SPIN_SECONDS: 7,
  /** Window after the sound is turned on in which a press is treated as the
   *  waking gesture rather than as a transport command. */
  WAKE_GRACE_MS: 320,
  /**
   * How long to let an out-loud autoplay attempt prove itself before falling
   * back to a silent start. Long enough for a slow connection to at least reach
   * buffering, short enough that nobody sits in silence wondering.
   */
  /** Let the guaranteed muted start actually begin before asking for sound. */
  AUTOPLAY_ASK_MS: 350,
  AUTOPLAY_PROBE_MS: 600,
  /** How often the current spot is written down, so a reload lands back on it. */
  RESUME_SAVE_MS: 4000,
  /** Below this, just start the track over — resuming two seconds in is noise. */
  RESUME_MIN_SECONDS: 4,
} as const;

export const YOUTUBE = {
  IFRAME_API_SRC: "https://www.youtube.com/iframe_api",
  /**
   * Deliberately tiny and parked offscreen. YouTube's adaptive bitrate ladder
   * keys off the player's rendered size, so a small surface pins us near 144p —
   * we throw the frames away and keep only the audio, which makes this the
   * single biggest bandwidth lever the iframe API exposes.
   */
  PLAYER_WIDTH: 160,
  PLAYER_HEIGHT: 90,
  /** Lowest first. We take the first level YouTube actually offers. */
  QUALITY_PREFERENCE: ["tiny", "small", "medium", "large"],
  PLAYER_VARS: {
    autoplay: 0,
    controls: 0,
    disablekb: 1,
    enablejsapi: 1,
    fs: 0,
    iv_load_policy: 3,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
  },
} as const;

export const SCENE = {
  /** Re-check the wall clock this often so the backdrop rolls over on its own. */
  PHASE_POLL_MS: 60_000,
  /** Old and new clips overlap for this long on a phase change. */
  CROSSFADE_MS: 2000,
} as const;

/** Who else is on the road right now, and what time it is where the songs are from. */
export const LIVE = {
  ENDPOINT: "/api/live",
  /**
   * Added on top of the connections actually counted, so the station never
   * reads as empty. Set to 0 to show only real listeners.
   */
  BASELINE: 20,
  /** Keeps proxies from culling an idle stream. */
  HEARTBEAT_MS: 25_000,
  RECONNECT_MS: 4000,
  /**
   * A serverless host cuts a long-lived stream off at its function timeout, so
   * a fixed retry becomes a permanent reconnect loop. Back off, then give up
   * and show nothing rather than hammering the endpoint forever.
   */
  RECONNECT_BACKOFF: 1.8,
  RECONNECT_MAX_MS: 60_000,
  RECONNECT_ATTEMPTS: 6,
  TIMEZONE: "Asia/Kolkata",
  CLOCK_TICK_MS: 1000,
} as const;

export const INTRO = {
  ENABLED: false,
  SHOTS: [
    {
      id: "approach",
      src: "/scenes/intro-1.mp4",
      poster: "/scenes/intro-1.jpg",
    },
    { id: "cabin", src: "/scenes/intro-2.mp4", poster: "/scenes/intro-2.jpg" },
    {
      id: "rollout",
      src: "/scenes/intro-3.mp4",
      poster: "/scenes/intro-3.jpg",
    },
  ],
  /** Index of the shot where the driver switches the stereo on. */
  AUDIO_CUE_SHOT: 1,
  /** Bring the music up this many seconds before that shot ends. */
  AUDIO_CUE_LEAD: 1.4,
  /** Clips are silent by default so nothing fights the song. */
  MUTED: true,
  CUT_MS: 260,
  OUTRO_MS: 1200,
  SKIP_AFTER_MS: 1400,
  /** Per tab, not per visit: a reload goes straight to the radio. */
  SESSION_KEY: "truckwala:intro-played",
} as const;

/**
 * The horn.
 *
 * Synthesised by default, so it works with no asset at all: an Indian musical
 * horn is a chord of reeds, which is three detuned saws through a lowpass with
 * a short pitch bend at the front. Drop a file at `SRC` and it takes over.
 */
export const HORN = {
  SRC: "/audio/horn.mp3",
  /** Roughly the chord a three-trumpet air horn actually sounds. */
  TONES: [233.08, 293.66, 349.23],
  DURATION_SECONDS: 0.9,
  ATTACK_SECONDS: 0.05,
  RELEASE_SECONDS: 0.3,
  PEAK_GAIN: 0.24,
  FILE_VOLUME: 0.85,
  /** Air-horn wind-up: start a shade flat and settle onto the note. */
  BEND_SEMITONES: -0.7,
  BEND_SECONDS: 0.1,
  FILTER_HZ: 2400,
  /** Stops a held key or a rapid double-tap from stacking blasts. */
  COOLDOWN_MS: 340,
  /** Beat of silence after the blast before the music comes back. */
  RESUME_GAP_SECONDS: 0.14,
  /** Ramp used when the horn is let go early — a hard stop clicks. */
  CUT_SECONDS: 0.06,
} as const;

export const UI = {
  /** How long the nudge lingers after the sound comes on, so it can fade. */
  HINT_EXIT_MS: 700,
  /** How long each spelling holds on the band switch before it turns over. */
  BAND_FLIP_MS: 2600,
} as const;

export const STORAGE_KEYS = {
  VOLUME: "truckwala:volume",
  STATION: "truckwala:station",
  MUTED: "truckwala:muted",
  RESUME: "truckwala:resume",
} as const;

/** Keyboard map. Values are intents resolved in useKeyboardControls. */
export const KEY_BINDINGS = {
  Space: "toggle",
  KeyK: "toggle",
  ArrowRight: "forward",
  KeyL: "forward",
  ArrowLeft: "rewind",
  KeyJ: "rewind",
  ArrowUp: "volumeUp",
  ArrowDown: "volumeDown",
  KeyN: "next",
  Period: "next",
  KeyP: "previous",
  Comma: "previous",
  KeyM: "mute",
  KeyB: "band",
} as const;

export type KeyIntent = (typeof KEY_BINDINGS)[keyof typeof KEY_BINDINGS];
