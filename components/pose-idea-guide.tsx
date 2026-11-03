'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PoseIllustration } from './pose-illustration';
import { POSE_CATEGORIES, type PoseCategoryId } from './pose-ideas';
import styles from './pose-idea-guide.module.css';

export function PoseIdeaGuide() {
  const [categoryId, setCategoryId] = useState<PoseCategoryId>('solo');
  const [selectedIndexes, setSelectedIndexes] = useState<Record<PoseCategoryId, number>>({
    solo: 0,
    couple: 0,
    funny: 0,
    friends: 0,
    family: 0,
    glam: 0,
  });
  const category = POSE_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return null;

  return (
    <aside aria-label="Photo pose ideas" className={styles.guide}>
      <div className={styles.heading}>
        <span aria-hidden="true" className={styles.sparkle}>✦</span>
        <div>
          <span className={styles.eyebrow}>NEED A POSE?</span>
          <h2>Pose ideas</h2>
        </div>
      </div>
      <p className={styles.description}>Choose a category to see pose pictures.</p>

      <div aria-label="Pose categories" className={styles.categories} role="group">
        {POSE_CATEGORIES.map((item) => (
          <button
            aria-pressed={categoryId === item.id}
            className={categoryId === item.id ? styles.activeCategory : ''}
            key={item.id}
            onClick={() => setCategoryId(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <ol aria-label={`${category.label} pose ideas`} className={styles.ideas}>
        {category.poses.map((pose, index) => (
          <li key={pose.name}>
            <button
              aria-pressed={selectedIndexes[categoryId] === index}
              className={selectedIndexes[categoryId] === index ? styles.activeIdea : ''}
              onClick={() => setSelectedIndexes((current) => ({ ...current, [categoryId]: index }))}
              aria-label={`${pose.name}. ${pose.description}`}
              type="button"
            >
              {'image' in pose && pose.image ? (
                <Image
                  alt=""
                  className={styles.poseImage}
                  height={640}
                  sizes="(max-width: 850px) 45vw, 120px"
                  src={pose.image}
                  width={424}
                />
              ) : (
                <PoseIllustration category={categoryId} index={index} />
              )}
              <span className={styles.poseName}>{pose.name}</span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
