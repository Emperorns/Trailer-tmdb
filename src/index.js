import { Router } from 'itty-router';

const router = Router();
const TMDB_API_KEY = 'af1f708691a1a8fa6862a85e2cc240ea'; // Replace with your key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper: Get trailer by type & ID
async function getTrailerById(type, id) {
  const url = `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('TMDB API error');
  const data = await resp.json();

  const trailer = data.results.find(
    v =>
      (v.type === 'Trailer' || v.type === 'Teaser') &&
      v.site === 'YouTube'
  );

  return trailer
    ? `https://www.youtube.com/watch?v=${trailer.key}`
    : null;
}

// Helper: Search TMDB by name — returns first matching ID
async function searchIdByName(type, name) {
  const url =
    type === 'movie'
      ? `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}`
      : `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error('TMDB API search error');
  const data = await resp.json();

  if (data.results && data.results.length > 0) {
    return data.results[0].id; // First match
  } else {
    return null;
  }
}

// ===== Routes =====

// Get trailer by movie ID
router.get('/trailer/movie/:id', async ({ params }) => {
  try {
    const trailerUrl = await getTrailerById('movie', params.id);
    return trailerUrl
      ? Response.json({ trailerUrl })
      : new Response('Trailer not found', { status: 404 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

// Get trailer by series ID
router.get('/trailer/series/:id', async ({ params }) => {
  try {
    const trailerUrl = await getTrailerById('tv', params.id);
    return trailerUrl
      ? Response.json({ trailerUrl })
      : new Response('Trailer not found', { status: 404 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

// Search movie trailer by name
router.get('/search/movie/:name', async ({ params }) => {
  try {
    const id = await searchIdByName('movie', params.name);
    if (!id) return new Response('Movie not found', { status: 404 });

    const trailerUrl = await getTrailerById('movie', id);
    return trailerUrl
      ? Response.json({ trailerUrl })
      : new Response('Trailer not found', { status: 404 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

// Search series trailer by name
router.get('/search/series/:name', async ({ params }) => {
  try {
    const id = await searchIdByName('tv', params.name);
    if (!id) return new Response('Series not found', { status: 404 });

    const trailerUrl = await getTrailerById('tv', id);
    return trailerUrl
      ? Response.json({ trailerUrl })
      : new Response('Trailer not found', { status: 404 });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
});

// Fallback
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: request => router.handle(request),
};
