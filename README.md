# Driver Drowsiness & Distraction Detection

An AI-powered web application for real-time driver safety monitoring using computer vision. This system detects drowsiness and distraction by analyzing facial features through the camera.

## Features

- **Real-time Drowsiness Detection**: Monitors eye closure using Eye Aspect Ratio (EAR) algorithm
- **Distraction Detection**: Tracks head position to detect when driver looks away from the road
- **Live Camera Feed**: Real-time video processing with visual feedback
- **Alert System**: Instant visual alerts when safety issues are detected
- **Confidence Metrics**: Displays detection confidence for transparency
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **face-api.js** - Face detection and landmark recognition
- **Canvas API** - Real-time video overlay rendering

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Camera access permissions in browser
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Navigate to the project directory:
```bash
cd driver-detection
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. Click "Start Camera" to activate the webcam
2. Allow camera permissions when prompted
3. Position your face in the camera frame
4. The system will automatically:
   - Detect your face and facial landmarks
   - Monitor eye closure for drowsiness
   - Track head position for distraction
   - Display alerts when issues are detected
5. Click "Stop Camera" to deactivate

## How It Works

### Drowsiness Detection
- Uses the Eye Aspect Ratio (EAR) algorithm to measure eye openness
- Calculates the ratio of vertical to horizontal eye distances
- Triggers alert when EAR falls below threshold (0.25)
- Monitors both left and right eyes for accuracy

### Distraction Detection
- Tracks head position using facial landmarks
- Calculates head turn (left/right) and tilt (up/down)
- Determines if driver is looking away from forward position
- Alerts when head position deviates significantly

### Visual Feedback
- Green border: Normal state (alert and focused)
- Red border: Alert state (drowsy or distracted)
- Real-time status panel showing detection results
- Pulsing alert banner for critical warnings

## Disclaimer

⚠️ This is a demonstration system for educational purposes. For real-world driver safety applications, integrate with:
- Professional vehicle safety systems
- Hardware-specific sensors
- Medical-grade monitoring equipment
- Proper regulatory compliance systems

## Development

### Project Structure

```
driver-detection/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   └── DriverDetection.tsx # Main detection component
├── public/                 # Static assets
└── package.json            # Dependencies
```

### Customization

You can adjust detection sensitivity by modifying these constants in `components/DriverDetection.tsx`:

- `EAR_THRESHOLD` (currently 0.25): Sensitivity for eye closure detection
- `HEAD_TURN_THRESHOLD` (currently 15): Degrees of head turn before alert
- `HEAD_TILT_THRESHOLD` (currently 0.3/0.7): Up/down tilt sensitivity

## Deployment

### Deploy on Vercel

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new):

```bash
npm run build
vercel
```

### Other Platforms

This app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with Node.js

## License

This project is open source and available for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
