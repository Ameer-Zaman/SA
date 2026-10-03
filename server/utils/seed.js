/**
 * Seeds starter content. Safe to run more than once (existing records are left alone).
 *
 * Only facts given in the project brief are used, and everything is marked UNVERIFIED.
 * Releases are created as unpublished drafts with no year, cover or links, so nothing
 * appears on the public site until an admin confirms the details and publishes it.
 */
import env from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Music from '../models/Music.js';
import Biography from '../models/Biography.js';
import WebsiteSettings from '../models/WebsiteSettings.js';

const BRIEF_TITLES = ['Economy', 'Manushyar', 'Eulogy', 'Alif', 'Ijj', 'Maarijan'];
const NOTE = 'Title from project brief. Confirm release type, solo/collab/group credit, year, artwork and official links before publishing.';

async function seed() {
  await connectDB(env.mongoUri);

  const settings = await WebsiteSettings.getSingleton();
  if (!settings.heroIntro) {
    settings.heroIntro = 'Rapper from Kerala. English rap and Malayalam hip-hop.';
    await settings.save();
  }
  console.log('✓ Website settings ready');

  const bio = await Biography.getSingleton();
  if (!bio.introduction) {
    bio.introduction =
      'SA is a rapper from Kerala, India, associated with the Kerala hip-hop scene and the rap collective Manushyar. His music moves between English rap and Malayalam hip-hop.';
    bio.biography = '';
    bio.musicalIdentity = {
      approach: '',
      influences: '',
      languages: 'SA raps in both English and Malayalam.',
      style: '',
    };
    bio.collaborations = [
      {
        name: 'Manushyar',
        kind: 'collective',
        description: 'Kerala rap collective. Confirm member list and add official links before marking as verified.',
        members: ['SA', 'Dabzee', 'M.H.R', 'Joker390P'],
        verified: false,
      },
    ];
    await bio.save();
  }
  console.log('✓ Biography ready (edit it in Admin → Biography)');

  let created = 0;
  for (const [i, title] of BRIEF_TITLES.entries()) {
    // eslint-disable-next-line no-await-in-loop
    if (await Music.exists({ title })) continue;
    // eslint-disable-next-line no-await-in-loop
    await Music.create({
      title,
      artists: ['SA'],
      published: false,
      verified: false,
      verificationNote: NOTE,
      sortOrder: BRIEF_TITLES.length - i,
    });
    created += 1;
  }
  console.log(`✓ ${created} draft release(s) created (unpublished, unverified)`);

  await disconnectDB();
}

seed().catch(async (err) => {
  console.error(err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
