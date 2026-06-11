const diseaseImageMap: Record<string, string> = {
  // Original mappings
  'Bud Rot': '/images/bud-rot.jpeg',
  'Leaf Spot': '/images/leaf-spot.jpeg',
  'Stem Rot': '/images/stem-rot.jpeg',
  'Root Rot': '/images/root-rot.jpeg',
  'Leaf Blight': '/images/leaf-blight.jpeg',
  'Coconut Leaf Spot': '/images/leaf-spot.jpeg',
  'Coconut Stem Rot': '/images/stem-rot.jpeg',

  // New mappings for the mock data
  'Stem Bleeding': '/images/stem-bleeding.jpeg',
  'Lethal Yellowing': '/images/lethal-yellowing.jpeg',
  'Root (Wilt) Disease': '/images/root-wilt.jpeg',
  'Gray Leaf Spot': '/images/gray-leaf-spot.jpeg',
};

export const getDiseaseThumbnailImage = (diseaseName: string): string | null => {
  return diseaseImageMap[diseaseName] || null;
};

export const getAllDiseaseImages = (): string[] => {
  return Object.values(diseaseImageMap);
};