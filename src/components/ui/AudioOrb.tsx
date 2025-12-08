'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  PARTICLE_COUNT: 3000,
  ORB_RADIUS: 2.5,
  NOISE_SCALE: 0.5,
  AUDIO_FFT_SIZE: 512,
  CAMERA_Z: 12,
  FOV: 75,
};

const COLORS = {
  speaking: {
    primary: new THREE.Color(0xa855f7),   // Purple
    secondary: new THREE.Color(0x3b82f6), // Blue
  },
  listening: {
    primary: new THREE.Color(0x14b8a6),   // Teal
    secondary: new THREE.Color(0x06b6d4), // Cyan
  },
  idle: {
    primary: new THREE.Color(0xea580c),   // Orange-600
    secondary: new THREE.Color(0xdc2626), // Red-600
  },
  active: {
    primary: new THREE.Color(0xa855f7),   // Purple
    secondary: new THREE.Color(0xec4899), // Pink
  },
};

// Mode-specific behavior parameters
const MODE_PARAMS = {
  idle: {
    noiseSpeed: 0.4,
    noiseAmplitude: 0.2,
    audioReactivity: 0.2,
    baseDisplacement: 0,
    rotationSpeed: 0.002,
    breatheSpeed: 0.5,
    breatheAmplitude: 0.03,
  },
  listening: {
    noiseSpeed: 2.0,        // Fast, busy
    noiseAmplitude: 0.4,
    audioReactivity: 0.3,   // Low audio reactivity
    baseDisplacement: 0.05,
    rotationSpeed: 0.006,
    breatheSpeed: 1.5,
    breatheAmplitude: 0.08,
  },
  speaking: {
    noiseSpeed: 0.5,        // Slow, fluid
    noiseAmplitude: 0.25,
    audioReactivity: 1.0,   // High audio reactivity
    baseDisplacement: 0,
    rotationSpeed: 0.003,
    breatheSpeed: 0.3,
    breatheAmplitude: 0.05,
  },
  active: {
    noiseSpeed: 1.0,
    noiseAmplitude: 0.35,
    audioReactivity: 0.6,
    baseDisplacement: 0.08,
    rotationSpeed: 0.004,
    breatheSpeed: 0.8,
    breatheAmplitude: 0.06,
  },
};

type OrbMode = 'idle' | 'active' | 'speaking' | 'listening';

interface AudioOrbProps {
  mode?: OrbMode;
  size?: number;
  className?: string;
  audioEnabled?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AudioOrb({
  mode = 'idle',
  size = 300,
  className = '',
  audioEnabled = false,
}: AudioOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const smoothedDataRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const currentModeRef = useRef<OrbMode>(mode);
  const timeRef = useRef(0);

  // Update mode ref when prop changes
  useEffect(() => {
    currentModeRef.current = mode;
  }, [mode]);

  // Create glow texture
  const createGlowTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = size;
    const height = size;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(CONFIG.FOV, width / height, 0.1, 1000);
    camera.position.z = CONFIG.CAMERA_Z;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.PARTICLE_COUNT * 3);
    const colors = new Float32Array(CONFIG.PARTICLE_COUNT * 3);
    const sizes = new Float32Array(CONFIG.PARTICLE_COUNT);
    const originalPositions = new Float32Array(CONFIG.PARTICLE_COUNT * 3);

    // Distribute particles on sphere
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = CONFIG.ORB_RADIUS * (0.8 + Math.random() * 0.4);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      // Initial color (cyan)
      colors[i3] = 0.13;     // R
      colors[i3 + 1] = 0.83; // G
      colors[i3 + 2] = 0.93; // B

      sizes[i] = 0.2 + Math.random() * 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.userData.originalPositions = originalPositions;

    // Material
    const material = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      map: createGlowTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.85,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016; // Approx 60fps

      if (!particlesRef.current) return;

      const geometry = particlesRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      const original = geometry.userData.originalPositions as Float32Array;

      const currentMode = currentModeRef.current;
      const modeColors = COLORS[currentMode] || COLORS.idle;
      const params = MODE_PARAMS[currentMode] || MODE_PARAMS.idle;

      const time = timeRef.current * params.noiseSpeed;

      // Get audio data if available
      let audioLevel = 0;
      if (analyserRef.current && dataArrayRef.current && smoothedDataRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Smooth the data
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          smoothedDataRef.current[i] += (dataArrayRef.current[i] - smoothedDataRef.current[i]) * 0.1;
        }

        // Calculate average level
        const sum = smoothedDataRef.current.reduce((a, b) => a + b, 0);
        audioLevel = (sum / smoothedDataRef.current.length / 255) * params.audioReactivity;
      }

      // Update particles
      for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const ox = original[i3];
        const oy = original[i3 + 1];
        const oz = original[i3 + 2];

        // Noise-based displacement with mode-specific amplitude
        const noiseX = Math.sin(time + oy * CONFIG.NOISE_SCALE) * params.noiseAmplitude;
        const noiseY = Math.cos(time + ox * CONFIG.NOISE_SCALE) * params.noiseAmplitude;
        const noiseZ = Math.sin(time * 0.7 + oz * CONFIG.NOISE_SCALE) * params.noiseAmplitude;

        // Additional high-frequency noise for listening mode (busy effect)
        let busyNoise = 0;
        if (currentMode === 'listening') {
          busyNoise = Math.sin(time * 3 + i * 0.1) * 0.15;
        }

        // Audio-based expansion
        const audioScale = 1 + audioLevel * 0.5 + params.baseDisplacement;

        // Breathing effect with mode-specific speed and amplitude
        const breathe = 1 + Math.sin(timeRef.current * params.breatheSpeed) * params.breatheAmplitude;

        // Apply transformations
        positions[i3] = ox * audioScale * breathe + noiseX + busyNoise;
        positions[i3 + 1] = oy * audioScale * breathe + noiseY;
        positions[i3 + 2] = oz * audioScale * breathe + noiseZ + busyNoise * 0.5;

        // Color lerp towards target (faster for mode changes)
        const lerpFactor = 0.05;
        const targetColor = i % 2 === 0 ? modeColors.primary : modeColors.secondary;
        colors[i3] += (targetColor.r - colors[i3]) * lerpFactor;
        colors[i3 + 1] += (targetColor.g - colors[i3 + 1]) * lerpFactor;
        colors[i3 + 2] += (targetColor.b - colors[i3 + 2]) * lerpFactor;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;

      // Rotation with mode-specific speed
      particlesRef.current.rotation.y += params.rotationSpeed;
      particlesRef.current.rotation.x = Math.sin(timeRef.current * 0.2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current);

      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.Material).dispose();
      }
    };
  }, [size, createGlowTexture]);

  // Audio setup
  useEffect(() => {
    if (!audioEnabled) return;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = CONFIG.AUDIO_FFT_SIZE;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        smoothedDataRef.current = new Float32Array(analyser.frequencyBinCount);
      } catch (err) {
        console.warn('Audio not available:', err);
      }
    };

    setupAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioEnabled]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
