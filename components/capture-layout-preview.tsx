/* eslint-disable @next/next/no-img-element -- Captures are in-memory data URLs. */
import styles from './capture-layout-preview.module.css';

export type CaptureLayout = 'strip' | 'doubleStrip' | 'grid' | 'trio' | 'polaroid';

const layoutClass: Record<CaptureLayout, string> = {
  strip: styles.strip,
  doubleStrip: styles.doubleStrip,
  grid: styles.grid,
  trio: styles.trio,
  polaroid: styles.polaroid,
};

export function CaptureLayoutPreview({
  layout,
  photos,
  photoLimit,
  selectedPhotoIndex,
  onSelectPhoto,
}: {
  layout: CaptureLayout;
  photos: string[];
  photoLimit: number;
  selectedPhotoIndex: number | null;
  onSelectPhoto: (index: number) => void;
}) {
  const photoIndexes = Array.from({ length: photoLimit }, (_, index) => index);
  const slotIndexes = layout === 'doubleStrip'
    ? [...photoIndexes, ...photoIndexes]
    : photoIndexes;
  const slots = slotIndexes.map((index, slotIndex) => ({
    index,
    photo: photos[index],
    key: `${index}-${slotIndex}`,
    strip: Math.floor(slotIndex / photoLimit) + 1,
  }));

  return (
    <div
      aria-label={`${layout} layout preview: ${photos.length} of ${photoLimit} photos captured`}
      aria-live="polite"
      className={`${styles.preview} ${layoutClass[layout]}`}
      role="group"
    >
      {slots.map(({ index, photo, key, strip }) => (
        photo ? (
          <button
            aria-label={`Select photo ${index + 1}${layout === 'doubleStrip' ? ` in strip ${strip}` : ''} to retake or remove`}
            aria-pressed={selectedPhotoIndex === index}
            className={`${styles.slot} ${styles.filledSlot} ${selectedPhotoIndex === index ? styles.selectedSlot : ''}`}
            key={key}
            onClick={() => onSelectPhoto(index)}
            type="button"
          >
            <img alt="" src={photo} />
          </button>
        ) : (
          <div className={styles.slot} key={key} />
        )
      ))}
    </div>
  );
}
