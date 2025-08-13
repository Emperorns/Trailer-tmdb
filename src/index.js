import { Router } from 'itty-router';

const router = Router();
const TMDB_API_KEY = 'af1f708691a1a8fa6862a85e2cc240ea'; // Replace this!

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to fetch trailer for movie or TV show
async function getTrailer(type, id) {
  const url = `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('TMDB API error');
  const data = await resp.json();

  // Find YouTube trailer
  const trailer = data.results.find(
    v =>
      (v.type === 'Trailer' || v.type === 'Teaser') &&
      v.site === 'YouTube'
  );
  return trailer
    ? `https://www.youtube.com/watch?v=${trailer.key}`
    : null;
}

// Route: GET /trailer/movie/:id
router.get('/trailer/movie/:id', async ({ params }) => {
  try {
    const trailerUrl = await getTrailer('movie', params.id);
    return trailerUrl
      ? Response.json({ trailerUrl })
      : new Response('Trailer not found', { status: 404 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

// Route: GET /trailer/series/:id
router.get('/trailer/series/:id', async ({ params }) => {
  try {
    const trailerUrl = await getTrailer('tv', params.id);
    return trailerUrl
      ? Response.json({ trailerUrl })
      : new Response('Trailer not found', { status: 404 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: (request) => router.handle(request)
};
