export const POSE_CATEGORIES = [
  {
    id: 'solo',
    label: 'Solo',
    poses: [
      { name: 'Face frame', description: 'Frame your cheeks with both hands and smile.', image: '/pose-ideas/solo/solo-01.png' },
      { name: 'Hand heart', description: 'Make a small heart shape with your hands.', image: '/pose-ideas/solo/solo-02.png' },
      { name: 'Peace sign', description: 'Hold a peace sign beside your face.', image: '/pose-ideas/solo/solo-03.png' },
      { name: 'Wink and heart', description: 'Wink and make a heart shape with your fingers.', image: '/pose-ideas/solo/solo-04.png' },
      { name: 'Double peace', description: 'Raise both hands for a playful double peace sign.', image: '/pose-ideas/solo/solo-05.png' },
    ],
  },
  {
    id: 'couple',
    label: 'Couples',
    poses: [
      { name: 'Close together', description: 'Lean in close and smile at the camera.', image: '/pose-ideas/couple/couple-01.png' },
      { name: 'Surprised together', description: 'Lean into the frame with playful surprised expressions.', image: '/pose-ideas/couple/couple-02.png' },
      { name: 'Cheek kiss', description: 'Share a playful cheek kiss while your partner poses for the camera.', image: '/pose-ideas/couple/couple-03.png' },
      { name: 'Matching shades', description: 'Wear matching sunglasses and pose like a cool duo.', image: '/pose-ideas/couple/couple-04.png' },
      { name: 'Silly shades', description: 'Try a matching sunglasses pose with playful expressions.', image: '/pose-ideas/couple/couple-05.png' },
    ],
  },
  {
    id: 'funny',
    label: 'Funny',
    poses: [
      { name: 'Wedding hand heart', description: 'Make tiny finger hearts with your best dramatic expressions.', image: '/pose-ideas/funny/funny-01.png' },
      { name: 'Double heart', description: 'Team up to make an oversized heart with your hands.', image: '/pose-ideas/funny/funny-02.png' },
      { name: 'Silly glasses', description: 'Wear goofy glasses and pull matching silly faces.', image: '/pose-ideas/funny/funny-03.png' },
      { name: 'Party pose', description: 'Stick out your tongue and throw a playful hand sign.', image: '/pose-ideas/funny/funny-04.png' },
      { name: 'Action pose', description: 'Point toward the camera like you are in a playful action scene.', image: '/pose-ideas/funny/funny-05.png' },
    ],
  },
  {
    id: 'friends',
    label: 'Friends',
    poses: [
      { name: 'Matching hats', description: 'Wear fun hats and lean in together for a cheerful group photo.', image: '/pose-ideas/friends/friends-01.png' },
      { name: 'Playful cheer', description: 'Raise your hands and make lively, happy expressions.', image: '/pose-ideas/friends/friends-02.png' },
      { name: 'Funny hats', description: 'Choose silly hats and make a playful group pose.', image: '/pose-ideas/friends/friends-03.png' },
      { name: 'Group heart', description: 'Work together to make one big heart with your hands.', image: '/pose-ideas/friends/friends-04.png' },
      { name: 'Back-to-back', description: 'Stand back-to-back and look confidently toward the camera.', image: '/pose-ideas/friends/friends-05.png' },
    ],
  },
  {
    id: 'family',
    label: 'Family',
    poses: [
      { name: 'Silly family hug', description: 'Squish in close and make funny faces together.', image: '/pose-ideas/family/family-01.png' },
      { name: 'Cozy group cuddle', description: 'Lean in close for a warm, affectionate family photo.', image: '/pose-ideas/family/family-02.png' },
      { name: 'Baby kisses', description: 'Gather around the little one for a sweet family moment.', image: '/pose-ideas/family/family-03.png' },
      { name: 'Holiday portrait', description: 'Arrange the family around a chair for a festive portrait.', image: '/pose-ideas/family/family-04.png' },
      { name: 'Stacked portrait', description: 'Line up one behind another so every face is in view.', image: '/pose-ideas/family/family-05.png' },
    ],
  },
  {
    id: 'glam',
    label: 'Glam',
    poses: [
      { name: 'Classic group portrait', description: 'Stand tall together and give the camera a polished look.', image: '/pose-ideas/glam/glam-01.png' },
      { name: 'Elegant lineup', description: 'Pose in a neat row with relaxed shoulders and confident smiles.', image: '/pose-ideas/glam/glam-02.png' },
      { name: 'Seated editorial', description: 'Sit close together in a relaxed, stylish group pose.', image: '/pose-ideas/glam/glam-03.png' },
      { name: 'Playful glam', description: 'Add a playful hand sign to a polished group pose.', image: '/pose-ideas/glam/glam-04.png' },
      { name: 'Solo editorial', description: 'Sit forward slightly and look confidently into the camera.', image: '/pose-ideas/glam/glam-05.png' },
    ],
  },
] as const;

export type PoseCategoryId = (typeof POSE_CATEGORIES)[number]['id'];
