/*
  # Coconut Disease Detection System Database Schema

  ## Overview
  This migration creates the database schema for the Coconut Disease Detection and Explainable AI system.

  ## New Tables
  
  ### `disease_info`
  Stores information about different coconut diseases
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Disease name
  - `scientific_name` (text) - Scientific name of the disease
  - `description` (text) - Detailed description
  - `symptoms` (text[]) - Array of symptoms
  - `causes` (text[]) - Array of causes
  - `treatment` (text) - Treatment recommendations
  - `prevention` (text) - Prevention measures
  - `severity` (text) - Severity level (Low, Medium, High, Critical)
  - `image_url` (text) - Reference image URL
  - `created_at` (timestamptz) - Creation timestamp

  ### `predictions`
  Stores disease prediction results
  - `id` (uuid, primary key) - Unique identifier
  - `image_url` (text) - Uploaded image URL
  - `predicted_disease` (text) - Predicted disease name
  - `confidence` (numeric) - Confidence score (0-1)
  - `gradcam_url` (text) - Grad-CAM visualization URL
  - `location` (text) - Location where image was taken (optional)
  - `notes` (text) - Additional notes (optional)
  - `created_at` (timestamptz) - Prediction timestamp
  - `metadata` (jsonb) - Additional metadata (model version, processing time, etc.)

  ## Security
  - Enable RLS on all tables
  - Public read access for disease_info (educational content)
  - Predictions are publicly insertable for demo purposes (no auth required)
  - All users can view prediction history
*/

-- Create disease_info table
CREATE TABLE IF NOT EXISTS disease_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scientific_name text,
  description text NOT NULL,
  symptoms text[] DEFAULT '{}',
  causes text[] DEFAULT '{}',
  treatment text,
  prevention text,
  severity text DEFAULT 'Medium',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  predicted_disease text NOT NULL,
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  gradcam_url text,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE disease_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disease_info (public read access)
CREATE POLICY "Anyone can view disease information"
  ON disease_info
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for predictions (public access for demo)
CREATE POLICY "Anyone can insert predictions"
  ON predictions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view predictions"
  ON predictions
  FOR SELECT
  TO public
  USING (true);

-- Insert sample disease information
INSERT INTO disease_info (name, scientific_name, description, symptoms, causes, treatment, prevention, severity, image_url) VALUES
(
  'Lethal Yellowing',
  'Phytoplasma palmae',
  'Lethal Yellowing is a devastating palm disease caused by phytoplasmas that disrupts nutrient transport in coconut trees. It spreads rapidly and can kill a tree within 3-6 months if left untreated.',
  ARRAY['Premature fruit drop', 'Blackening of inflorescences', 'Yellowing of lower fronds', 'Progressive yellowing moving upward', 'Death of crown'],
  ARRAY['Phytoplasma bacteria transmitted by planthoppers', 'Insect vectors (Myndus crudus)', 'Infected planting material'],
  'Remove and destroy infected trees immediately. Inject antibiotic treatments (oxytetracycline) into healthy trees as a preventive measure. Control planthopper populations with appropriate insecticides.',
  'Plant resistant varieties. Regular monitoring and early detection. Vector control through insecticide application. Remove infected trees promptly to prevent spread.',
  'Critical',
  'https://images.pexels.com/photos/4505451/pexels-photo-4505451.jpeg'
),
(
  'Leaf Spot',
  'Pestalotiopsis sp.',
  'Leaf Spot disease causes circular or irregular brown spots on coconut leaves, reducing photosynthetic capacity and overall tree vigor. While not immediately lethal, severe infections can significantly impact yield.',
  ARRAY['Circular brown spots on leaves', 'Yellow halos around spots', 'Spots may merge in severe cases', 'Leaf yellowing and premature death', 'Reduced photosynthesis'],
  ARRAY['Fungal infection (Pestalotiopsis, Colletotrichum)', 'High humidity and moisture', 'Poor air circulation', 'Nutrient deficiencies', 'Mechanical damage to leaves'],
  'Apply copper-based fungicides or systemic fungicides. Improve drainage and air circulation. Remove and destroy severely infected leaves. Apply balanced fertilizers to improve tree health.',
  'Maintain proper spacing between trees. Ensure good drainage. Apply preventive fungicide sprays during humid seasons. Regular pruning of dead fronds. Balanced fertilization to boost immunity.',
  'Medium',
  'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg'
),
(
  'Bud Rot',
  'Phytophthora palmivora',
  'Bud Rot is a serious fungal disease that attacks the growing point (bud) of the coconut palm, leading to rapid death of the tree. It spreads quickly in wet conditions and can devastate entire plantations.',
  ARRAY['Rotting of the central bud', 'Foul odor from affected area', 'Wilting and drooping of young leaves', 'Browning of spear leaf', 'Eventual collapse of crown'],
  ARRAY['Phytophthora fungus infection', 'Excessive rainfall and poor drainage', 'High humidity', 'Wounds or mechanical damage', 'Contaminated tools or equipment'],
  'Early detection is crucial. Remove infected tissue surgically. Apply copper-based fungicides or Bordeaux mixture. Improve drainage around affected trees. In severe cases, tree removal may be necessary.',
  'Plant in well-drained soils. Avoid water accumulation at tree base. Sanitize tools between trees. Apply preventive fungicide treatments during rainy season. Regular inspection of tree crowns.',
  'High',
  'https://images.pexels.com/photos/6476583/pexels-photo-6476583.jpeg'
),
(
  'Stem Bleeding',
  'Thielaviopsis paradoxa',
  'Stem Bleeding disease causes reddish-brown exudates to ooze from the trunk of coconut palms. The fungal infection weakens the structural integrity of the tree and can lead to eventual death if untreated.',
  ARRAY['Reddish-brown liquid oozing from trunk', 'Dark discoloration of bark', 'Vertical cracks in trunk', 'Wilting of lower fronds', 'Reduced nut production', 'Tree instability'],
  ARRAY['Fungal infection (Thielaviopsis paradoxa)', 'Wounds or injuries to trunk', 'Insect boring damage', 'Poor soil health', 'Water stress'],
  'Remove infected bark tissue carefully. Apply fungicide paste (Bordeaux paste or copper oxychloride) to affected areas. Inject systemic fungicides. Improve soil nutrition and water management.',
  'Avoid mechanical damage to trunks during cultivation. Control boring insects. Maintain tree vigor through proper fertilization. Regular trunk inspection. Apply protective fungicide treatments to wounds.',
  'High',
  'https://images.pexels.com/photos/5231075/pexels-photo-5231075.jpeg'
),
(
  'Healthy',
  'N/A',
  'Healthy coconut palms display vibrant green fronds, regular nut production, and strong growth. Regular monitoring and proper care maintain tree health and maximize yield.',
  ARRAY['Vibrant green leaves', 'Regular flowering and nut set', 'Strong trunk growth', 'No discoloration or spots', 'Good overall vigor'],
  ARRAY['Proper nutrition', 'Adequate water supply', 'Good soil health', 'Pest and disease management', 'Optimal growing conditions'],
  'No treatment needed. Continue regular maintenance and monitoring.',
  'Regular fertilization with balanced NPK. Adequate irrigation during dry periods. Regular monitoring for early disease detection. Maintain soil health with organic matter. Proper spacing and pruning.',
  'Low',
  'https://images.pexels.com/photos/1423149/pexels-photo-1423149.jpeg'
);
