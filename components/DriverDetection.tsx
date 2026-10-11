'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

interface DetectionState {
  isDrowsy: boolean;
  isDistracted: boolean;
  eyesClosed: boolean;
  headPosition: 'forward' | 'left' | 'right' | 'up' | 'down';
  confidence: number;
}

export default function DriverDetection() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionState, setDetectionState] = useState<DetectionState>({
    isDrowsy: false,
    isDistracted: false,
    eyesClosed: false,
    headPosition: 'forward',
    confidence: 0,
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      setIsModelLoaded(true);
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsCameraActive(false);
  };

  const calculateEyeAspectRatio = (landmarks: faceapi.FaceLandmarks68) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEAR = eyeAspectRatio(leftEye);
    const rightEAR = eyeAspectRatio(rightEye);
    return (leftEAR + rightEAR) / 2;
  };

  const eyeAspectRatio = (eye: faceapi.Point[]) => {
    const A = Math.sqrt(
      Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2)
    );
    const B = Math.sqrt(
      Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2)
    );
    const C = Math.sqrt(
      Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2)
    );
    return (A + B) / (2 * C);
  };

  const detectDrowsinessAndDistraction = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        const detection = detections[0];
        const landmarks = detection.landmarks;
        const expressions = detection.expressions;

        const avgEAR = calculateEyeAspectRatio(landmarks);
        const eyesClosed = avgEAR < 0.25;

        const nose = landmarks.getNose()[3];
        const leftCheek = landmarks.getLeftEyeBrow();
        const rightCheek = landmarks.getRightEyeBrow();
        
        const faceCenter = ((leftCheek[0].x + rightCheek[4].x) / 2);
        const headTurn = (nose.x - faceCenter) * 100;
        
        const jaw = landmarks.getJawOutline();
        const forehead = landmarks.getNose()[0];
        const chin = jaw[jaw.length - 1];
        const faceHeight = Math.abs(chin.y - forehead.y);
        const headTilt = (nose.y - forehead.y) / faceHeight;

        let headPosition: 'forward' | 'left' | 'right' | 'up' | 'down' = 'forward';
        if (headTurn < -15) headPosition = 'left';
        else if (headTurn > 15) headPosition = 'right';
        else if (headTilt < 0.3) headPosition = 'up';
        else if (headTilt > 0.7) headPosition = 'down';

        const isDistracted = headPosition !== 'forward';
        const isDrowsy = eyesClosed || expressions.drowsy > 0.5;

        setDetectionState({
          isDrowsy,
          isDistracted,
          eyesClosed,
          headPosition,
          confidence: detection.detection.score,
        });

        if (isDrowsy) {
          setAlertMessage('⚠️ DROWSINESS DETECTED - Wake up!');
          setShowAlert(true);
        } else if (isDistracted) {
          setAlertMessage(`⚠️ DISTRACTION DETECTED - Looking ${headPosition}`);
          setShowAlert(true);
        } else {
          setShowAlert(false);
        }

        const box = detection.detection.box;
        ctx.strokeStyle = isDrowsy || isDistracted ? '#ff0000' : '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        faceapi.draw.drawFaceLandmarks(canvas, detections);
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectDrowsinessAndDistraction);
  }, []);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isCameraActive && isModelLoaded) {
      detectDrowsinessAndDistraction();
    }
  }, [isCameraActive, isModelLoaded, detectDrowsinessAndDistraction]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                  <p className="text-white text-lg">Camera inactive</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Status Panel</h2>
              {!isModelLoaded && (
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
                  <p className="text-yellow-200 text-sm">Loading AI models...</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${detectionState.isDrowsy ? 'bg-red-500/30 border border-red-500' : 'bg-green-500/20 border border-green-500'}`}>
                <p className="text-white font-semibold">Drowsiness Status</p>
                <p className={`text-lg ${detectionState.isDrowsy ? 'text-red-200' : 'text-green-200'}`}>
                  {detectionState.isDrowsy ? 'DROWSY DETECTED' : 'Alert'}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${detectionState.isDistracted ? 'bg-orange-500/30 border border-orange-500' : 'bg-green-500/20 border border-green-500'}`}>
                <p className="text-white font-semibold">Distraction Status</p>
                <p className={`text-lg ${detectionState.isDistracted ? 'text-orange-200' : 'text-green-200'}`}>
                  {detectionState.isDistracted ? `Looking ${detectionState.headPosition}` : 'Focused'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500">
                <p className="text-white font-semibold">Detection Confidence</p>
                <p className="text-lg text-blue-200">{(detectionState.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex gap-3">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  disabled={!isModelLoaded}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {isModelLoaded ? 'Start Camera' : 'Loading...'}
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Stop Camera
                </button>
              )}
            </div>
          </div>
        </div>

        {showAlert && (
          <div className="mt-6 bg-red-600/90 border-2 border-red-400 rounded-xl p-6 animate-pulse">
            <p className="text-white text-2xl font-bold text-center">{alertMessage}</p>
          </div>
        )}

        <div className="mt-6 text-center text-purple-200 text-sm">
          <p>⚠️ This is a demonstration system. For real-world use, integrate with proper vehicle safety systems.</p>
        </div>
      </div>
    </div>
  );
}
