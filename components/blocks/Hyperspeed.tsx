
import React, { useEffect, useRef } from 'react';

interface HyperspeedProps {
  effectOptions?: {
    lineColor?: string;
    speed?: number;
    distortion?: number;
    fieldOfView?: number;
  };
}

export const Hyperspeed: React.FC<HyperspeedProps> = ({ effectOptions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fix: Extract properties with safe fallback to handle potential undefined effectOptions
  const options = effectOptions || {};
  const lineColor = options.lineColor || '#f43f5e';
  const speed = options.speed || 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    let animationFrameId: number;
    let width: number;
    let height: number;

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float time;
      uniform vec2 resolution;
      uniform vec3 color;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.y, resolution.x);
        float t = time * 0.5;
        
        vec3 finalColor = vec3(0.0);
        
        for(float i=0.0; i<3.0; i++) {
          vec2 p = uv;
          float d = length(p);
          float angle = atan(p.y, p.x);
          
          float s = 0.5 + 0.5 * sin(t + i * 1.5);
          float lines = sin(angle * 20.0 + t * 5.0) * 0.5 + 0.5;
          lines *= smoothstep(0.1, 0.5, d);
          lines *= (1.0 - d);
          
          finalColor += color * lines * s;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'time');
    const resLoc = gl.getUniformLocation(program, 'resolution');
    const colorLoc = gl.getUniformLocation(program, 'color');

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    };

    const rgb = hexToRgb(lineColor);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = (now: number) => {
      gl.uniform1f(timeLoc, now * 0.001 * speed);
      gl.uniform2f(resLoc, width, height);
      gl.uniform3f(colorLoc, rgb[0], rgb[1], rgb[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [lineColor, speed]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full bg-black block" />;
};
