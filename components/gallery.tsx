'use client';
/* eslint-disable @next/next/no-img-element -- Gallery entries are local data URLs created in the browser. */

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Icon } from './icon';
import styles from './gallery.module.css';

const GALLERY_KEY = 'snapsync-gallery-v1';
type GalleryPhoto = { id: string; image: string; createdAt: string };
const GALLERY_EVENT = 'snapsync-gallery-change';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(GALLERY_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(GALLERY_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(GALLERY_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot() {
  return '[]';
}

export function Gallery() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let photos: GalleryPhoto[] = [];
  try {
    photos = JSON.parse(data) as GalleryPhoto[];
  } catch {
    photos = [];
  }

  function removePhoto(id: string) {
    const next = photos.filter((photo) => photo.id !== id);
    try {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(GALLERY_EVENT));
    } catch {
      // The current gallery remains visible if storage is unavailable.
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link aria-label="Back to SnapSync home" className={styles.brand} href="/">
          <span className={styles.brandMark}><Icon name="camera" /></span>
          Snap<span>Sync</span>
        </Link>
        <Link className={styles.backLink} href="/">Back home</Link>
      </header>
      <section className={styles.content}>
        <span className={styles.eyebrow}><Icon name="sparkles" /> YOUR GALLERY</span>
        <h1>Your favorite <span>moments.</span></h1>
        <p className={styles.description}>Photos saved on this device appear here. They stay private in this browser.</p>
        {photos.length ? (
          <div className={styles.grid}>
            {photos.map((photo) => (
              <article className={styles.card} key={photo.id}>
                <img alt={`SnapSync photo saved ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(photo.createdAt))}`} src={photo.image} />
                <footer>
                  <time dateTime={photo.createdAt}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(photo.createdAt))}</time>
                  <a download="snapsync-photo.jpg" href={photo.image}>Download</a>
                  <button aria-label="Remove photo from gallery" onClick={() => removePhoto(photo.id)} type="button">Remove</button>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Icon name="camera" /></span>
            <h2>Your gallery is ready</h2>
            <p>Once you save a photo, you’ll find it here on this device.</p>
            <Link className={styles.startButton} href="/booth">Take your first photo <Icon name="arrow" /></Link>
          </div>
        )}
      </section>
    </main>
  );
}
