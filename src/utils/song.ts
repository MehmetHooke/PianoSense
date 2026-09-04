// src/utils/song.ts

export function getSongOrderFromId(songId?: string | null): number | null {
  if (!songId) {
    return null;
  }

  const match = songId.match(/^song_(\d+)$/);

  if (!match) {
    return null;
  }

  const order = Number(match[1]);

  if (!Number.isFinite(order)) {
    return null;
  }

  return order;
}
