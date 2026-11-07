// Radios de la 1.0 (flux en direct) pour la 2.0. Les playlists embarquées (MP3) et les liens
// qui s'ouvrent dans un onglet (SomaFM) ne sont pas repris pour l'instant.
// Ajouter une radio : une ligne ici, après les tests habituels (lecture depuis un autre site,
// publicité, licence).
export const STATIONS = [
  { id: 'chillhop', kind: 'stream', group: 'Radios chill', name: 'Radio I♥Chillhop', desc: 'ilovemusic.de · chillhop', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { id: 'lautlofi', kind: 'stream', group: 'Radios chill', name: 'Radio lofi (laut.fm, avec pub)', desc: 'laut.fm · lofi · avec publicité', url: 'https://stream.laut.fm/lofi' },
  { id: 'chillsynth', kind: 'stream', group: 'Radios chill', name: 'Radio Chillsynth', desc: 'Nightride FM · synthwave calme', url: 'https://stream.nightride.fm/chillsynth.mp3' },
  { id: 'rpmellow', kind: 'stream', group: 'Radios chill', name: 'Radio Paradise Mellow', desc: 'Radio Paradise · mélange doux', url: 'https://stream.radioparadise.com/mellow-128' },
  { id: 'lautminimal', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio minimal (laut.fm, avec pub)', desc: 'laut.fm · minimal techno, microhouse · avec publicité', url: 'https://stream.laut.fm/minimal' },
  { id: 'sleepingpill', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Ambient Sleeping Pill', desc: 'stereoscenic.com · ambient sans rythme', url: 'https://radio.stereoscenic.com/asp-h' },
  { id: 'lautambient', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio ambient (laut.fm, avec pub)', desc: 'laut.fm · ambient, chillout · avec publicité', url: 'https://stream.laut.fm/ambient' },
  { id: 'fipelectro', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio FIP Electro', desc: 'Radio France · électro, house, downtempo · sans pub', url: 'https://icecast.radiofrance.fr/fipelectro-midfi.mp3' },
  { id: 'igfm', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Intergalactic FM (techno)', desc: 'Intergalactic FM · techno, électro · sans pub', url: 'https://radio.intergalactic.fm/1' },
  { id: 'igfmdream', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Intergalactic FM Dream Machine', desc: 'Intergalactic FM · électronique planante · sans pub', url: 'https://radio.intergalactic.fm/3' },
  { id: 'nts1', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio NTS 1', desc: 'NTS · sélections électro et expérimentales · sans pub', url: 'https://stream-relay-geo.ntslive.net/stream' },
  { id: 'nts2', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio NTS 2', desc: 'NTS · sélections électro et expérimentales · sans pub', url: 'https://stream-relay-geo.ntslive.net/stream2' },
  { id: 'tlminimal', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Technolovers Minimal', desc: 'technolovers.fm · minimal techno', url: 'https://stream.technolovers.fm/minimal' },
  { id: 'tldeephouse', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Technolovers Deep House', desc: 'technolovers.fm · deep house', url: 'https://stream.technolovers.fm/deep-house' },
  { id: 'tltechno', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Technolovers Techno', desc: 'technolovers.fm · techno', url: 'https://stream.technolovers.fm/techno' },
  { id: 'hmtechno', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Hirschmilch Techno', desc: 'hirschmilch.de · techno · sans pub', url: 'https://hirschmilch.de:7000/techno.mp3' },
  { id: 'hmprogressive', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Hirschmilch Progressive', desc: 'hirschmilch.de · progressive, psy douce · sans pub', url: 'https://hirschmilch.de:7000/progressive.mp3' },
  { id: 'hmelectronic', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Hirschmilch Electronic', desc: 'hirschmilch.de · house, électro mélodique · sans pub', url: 'https://hirschmilch.de:7000/electronic.mp3' },
  { id: 'hmchillout', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Hirschmilch Chillout', desc: 'hirschmilch.de · ambient, chillout · sans pub', url: 'https://hirschmilch.de:7000/chillout.mp3' },
  { id: 'amambient', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio a.m. ambient', desc: 'stereoscenic.com · ambient planant · sans pub', url: 'https://radio.stereoscenic.com/ama-h' },
  { id: 'ambientmodern', kind: 'stream', group: 'Radios électro (style Work with Paul)', name: 'Radio Ambient Modern', desc: 'stereoscenic.com · ambient, post-rock doux · sans pub', url: 'https://radio.stereoscenic.com/mod-h' },
  { id: 'rectechno', kind: 'stream', group: 'Radios Record (Russie, pub probable)', name: 'Radio Record Techno (pub probable)', desc: 'Radio Record · techno · jingles en russe', url: 'https://radiorecord.hostingradio.ru/techno96.aacp' },
  { id: 'recminimal', kind: 'stream', group: 'Radios Record (Russie, pub probable)', name: 'Radio Record Minimal (pub probable)', desc: 'Radio Record · minimal, tech house · jingles en russe', url: 'https://radiorecord.hostingradio.ru/mini96.aacp' },
  { id: 'recambient', kind: 'stream', group: 'Radios Record (Russie, pub probable)', name: 'Radio Record Ambient (pub probable)', desc: 'Radio Record · ambient · jingles en russe', url: 'https://radiorecord.hostingradio.ru/ambient96.aacp' },
  { id: 'bwmirchi', kind: 'stream', group: 'Radios Bollywood (pub probable)', name: 'Radio Mirchi Top 20 (pub probable)', desc: 'Radio Mirchi · tubes Bollywood du moment', url: 'https://drive.uber.radio/uber/bollywoodnow/icecast.audio' },
  { id: 'bw2010', kind: 'stream', group: 'Radios Bollywood (pub probable)', name: 'Radio Bollywood 2010s (pub probable)', desc: 'uber.radio · Bollywood des années 2010', url: 'https://drive.uber.radio/uber/bollywood2010s/icecast.audio' },
  { id: 'fmopera', kind: 'stream', group: 'Radios classique et opéra', name: 'Radio France Musique Opéra', desc: 'Radio France · opéra, chant · sans pub', url: 'https://icecast.radiofrance.fr/francemusiqueopera-midfi.mp3' },
  { id: 'fmclassiqueplus', kind: 'stream', group: 'Radios classique et opéra', name: 'Radio France Musique Classique Plus', desc: 'Radio France · grandes œuvres · sans pub', url: 'https://icecast.radiofrance.fr/francemusiqueclassiqueplus-midfi.mp3' },
  { id: 'fmbaroque', kind: 'stream', group: 'Radios classique et opéra', name: 'Radio France Musique Baroque', desc: 'Radio France · baroque · sans pub', url: 'https://icecast.radiofrance.fr/francemusiquebaroque-midfi.mp3' },
  { id: 'fmeasy', kind: 'stream', group: 'Radios classique et opéra', name: 'Radio France Musique Easy Classique', desc: 'Radio France · classique doux · sans pub', url: 'https://icecast.radiofrance.fr/francemusiqueeasyclassique-midfi.mp3' },
  { id: 'swissclassic', kind: 'stream', group: 'Radios classique et opéra', name: 'Radio Swiss Classic', desc: 'SRG SSR (radio publique suisse) · classique, peu de paroles · sans pub', url: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128' },
];

// Radios cochées au départ dans « Musiques du menu » (comme la 1.0).
export const SHOWN_STATIONS = ['tlminimal', 'tltechno', 'hmtechno', 'hmprogressive', 'hmelectronic', 'hmchillout', 'amambient', 'ambientmodern', 'fmopera', 'fmclassiqueplus', 'fmbaroque', 'fmeasy', 'swissclassic'];

// ID client Google (public) de la 1.0 : projet Google Cloud « projetfocus », origines
// autorisées http://localhost:8417 et https://darkcapp68-web.github.io. Le code secret du
// client n'est jamais utilisé ni écrit dans le dépôt.
export const CLIENT_ID = '1037045732074-h7jfi17r74sdgnrjqspprvtm18i2dlgm.apps.googleusercontent.com';
