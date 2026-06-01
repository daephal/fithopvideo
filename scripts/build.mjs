import { mkdir, readFile, rm, stat, cp } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const htmlFile = 'FITCLIP Player.html';

async function assertExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  try {
    await stat(fullPath);
  } catch {
    throw new Error(`Missing required file: ${relativePath}`);
  }
}

function isExternalReference(value) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('data:') || value.startsWith('#');
}

async function validateHtmlReferences() {
  const html = await readFile(path.join(root, htmlFile), 'utf8');
  const refs = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);

  for (const ref of refs) {
    if (isExternalReference(ref)) continue;
    await assertExists(decodeURIComponent(ref));
  }
}

async function validateDataFiles() {
  const window = {};
  globalThis.window = window;

  const stateJs = await readFile(path.join(root, 'assets/js/state.js'), 'utf8');
  const helpersJs = await readFile(path.join(root, 'assets/js/helpers.js'), 'utf8');
  const dataJs = await readFile(path.join(root, 'assets/js/data.js'), 'utf8');
  const translationsJs = await readFile(path.join(root, 'assets/js/translations.js'), 'utf8');

  Function(stateJs)();
  Function(helpersJs)();
  Function(dataJs)();
  Function(translationsJs)();

  if (!window.RILLIZ_DATA?.fitclips?.length) {
    throw new Error('RILLIZ_DATA.fitclips was not initialized.');
  }
  if (!window.RILLIZ_COPY?.KR || !window.RILLIZ_COPY?.EN || !window.RILLIZ_COPY?.JP) {
    throw new Error('RILLIZ_COPY language data was not initialized.');
  }

  const storageKeys = window.FITHOP_STORAGE_KEYS || {};
  for (const key of ['lang', 'playlists', 'favorites', 'selectedFitclip']) {
    if (!storageKeys[key]) throw new Error(`Missing storage key: ${key}`);
  }

  const requiredFitclipFields = [
    'fitclipNumber', 'uploadMonth', 'albumCoverUrl', 'coverGradient',
    'trackCount', 'ownedCount', 'availableCount', 'tracks',
  ];
  const requiredTrackFields = [
    'id', 'fitclipNumber', 'clipIndex', 'artist', 'songTitle', 'displayTitle',
    'choreo', 'bpm', 'category', 'duration', 'videoProvider', 'videoEmbedUrl',
    'thumbnailUrl', 'purchased', 'subscriptionStatus', 'paymentProvider', 'versions',
  ];

  for (const fitclip of window.RILLIZ_DATA.fitclips) {
    for (const field of requiredFitclipFields) {
      if (!(field in fitclip)) throw new Error(`FITCLIP ${fitclip.fitclipNumber} missing field: ${field}`);
    }
    for (const track of fitclip.tracks) {
      for (const field of requiredTrackFields) {
        if (!(field in track)) throw new Error(`Track ${track.id} missing field: ${field}`);
      }
      if (!Array.isArray(track.versions)) throw new Error(`Track ${track.id} versions must be an array.`);
    }
  }

  const helpers = window.FITHOP_HELPERS;
  const cases = [
    [{ purchased: true, subscriptionStatus: 'active' }, true, false, 'watchable'],
    [{ purchased: true, subscriptionStatus: 'inactive' }, false, false, 'purchased_membership_required'],
    [{ purchased: false, subscriptionStatus: 'active' }, false, true, 'purchase_available'],
    [{ purchased: false, subscriptionStatus: 'none' }, false, false, 'membership_required'],
  ];
  for (const [track, canWatch, canPurchase, state] of cases) {
    if (helpers.canWatchTrack(track) !== canWatch) throw new Error(`canWatchTrack policy failed for ${state}`);
    if (helpers.canPurchaseTrack(track) !== canPurchase) throw new Error(`canPurchaseTrack policy failed for ${state}`);
    if (helpers.getTrackAccessState(track) !== state) throw new Error(`getTrackAccessState policy failed for ${state}`);
  }
}

await assertExists(htmlFile);
await assertExists('assets');
await validateHtmlReferences();
await validateDataFiles();

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, htmlFile), path.join(dist, htmlFile));
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
await cp(path.join(root, 'uploads'), path.join(dist, 'uploads'), { recursive: true });

console.log(`Static build complete: ${path.relative(root, dist)}`);
