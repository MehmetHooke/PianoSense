import { storage } from "@/src/services/firebase";
import { getDownloadURL, ref } from "firebase/storage";

const songImageUrlCache = new Map<number, string>();

export async function getSongImageUrl(order: number) {
  const cachedUrl = songImageUrlCache.get(order);

  if (cachedUrl) {
    return cachedUrl;
  }

  const imageRef = ref(storage, `system/songImages/${order}.jpeg`);

  const url = await getDownloadURL(imageRef);

  songImageUrlCache.set(order, url);

  return url;
}
