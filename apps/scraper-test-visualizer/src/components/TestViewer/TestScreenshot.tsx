import React, { useState, useEffect, useRef } from 'react';
import { Segment, Header } from 'semantic-ui-react';
import type { Coords } from '@thecointech/scraper';

export interface CoordBox {
  coords: Coords;
  color?: string;
}

interface TestScreenshotProps {
  testKey: string;
  position?: { position_x?: number; position_y?: number };
  coordBoxes?: CoordBox[];
}

export const TestScreenshot: React.FC<TestScreenshotProps> = ({ testKey, position, coordBoxes = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = `/api/image/${testKey}`;

    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setError(false);
      drawCanvas();
    };

    img.onerror = () => {
      setError(true);
      setImageLoaded(false);
    };
  }, [testKey]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, position, coordBoxes]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Draw coordinate boxes
    coordBoxes.forEach((box) => {
      const color = box.color || 'blue';

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.coords.left, box.coords.top, box.coords.width, box.coords.height);

      // Add semi-transparent fill for visibility
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = color;
      ctx.fillRect(box.coords.left, box.coords.top, box.coords.width, box.coords.height);
      ctx.globalAlpha = 1.0; // Reset alpha
    });

    // Draw position marker if available
    if (position?.position_x !== undefined && position?.position_y !== undefined) {
      const x = position.position_x;
      const y = position.position_y;

      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Add white border for visibility
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  if (error) {
    return (
      <Segment>
        <Header as="h3">Test Screenshot</Header>
        <p>Image not available</p>
      </Segment>
    );
  }

  return (
    <Segment>
      <Header as="h3">Test Screenshot</Header>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: isExpanded ? '100%' : '300px',
          border: '1px solid #ddd',
          cursor: 'pointer',
          transition: 'max-width 0.2s ease',
          display: imageLoaded ? 'block' : 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      {!imageLoaded && !error && <p>Loading...</p>}
    </Segment>
  );
};
