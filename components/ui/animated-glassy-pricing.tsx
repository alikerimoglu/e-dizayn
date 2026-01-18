import React, { useRef, useEffect, useState } from 'react';
import { RippleButton } from "./multi-type-ripple-buttons";
import { Check } from 'lucide-react';

// --- Internal Helper Components (Not exported) --- //

const CheckIcon = ({ className }: { className?: string }) => (
  <Check className={className} />
);

const ShaderCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glProgramRef = useRef<WebGLProgram | null>(null);
  const glBgColorLocationRef = useRef<WebGLUniformLocation | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const [backgroundColor, setBackgroundColor] = useState([0.97, 0.98, 0.99]); // Slight off-white for light mode

  useEffect(() => {
    const root = document.documentElement;
    const updateColor = () => {
      const isDark = root.classList.contains('dark');
      setBackgroundColor(isDark ? [0.01, 0.01, 0.02] : [0.97, 0.98, 0.99]);
    };
    updateColor();
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateColor();
        }
      }
    });
    observer.observe(root, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    const program = glProgramRef.current;
    const location = glBgColorLocationRef.current;
    if (gl && program && location) {
      gl.useProgram(program);
      gl.uniform3fv(location, new Float32Array(backgroundColor));
    }
  }, [backgroundColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) { console.error("WebGL not supported"); return; }
    glRef.current = gl;

    const vertexShaderSource = `attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;
    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 uBackgroundColor;
      mat2 rotate2d(float angle){ float c=cos(angle),s=sin(angle); return mat2(c,-s,s,c); }
      float variation(vec2 v1,vec2 v2,float strength,float speed){ return sin(dot(normalize(v1),normalize(v2))*strength+iTime*speed)/100.0; }
      vec3 paintCircle(vec2 uv,vec2 center,float rad,float width){
        vec2 diff = center-uv;
        float len = length(diff);
        len += variation(diff,vec2(0.,1.),5.,2.);
        float circle = smoothstep(rad-width,rad,len)-smoothstep(rad,rad+width,len);
        return vec3(circle);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        uv.x *= 1.5; uv.x -= 0.25;
        float mask = 0.0;
        float radius = .35;
        vec2 center = vec2(.5);
        mask += paintCircle(uv,center,radius,.035).r;
        mask += paintCircle(uv,center,radius-.018,.01).r;
        mask += paintCircle(uv,center,radius+.018,.005).r;
        vec2 v=rotate2d(iTime)*uv;
        vec3 foregroundColor=vec3(v.x,v.y,.7-v.y*v.x);
        vec3 color=mix(uBackgroundColor,foregroundColor,mask);
        color=mix(color,vec3(1.),paintCircle(uv,center,radius,.003).r);
        gl_FragColor=vec4(color,1.);
      }`;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation error");
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    glProgramRef.current = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iTimeLoc = gl.getUniformLocation(program, 'iTime');
    const iResLoc = gl.getUniformLocation(program, 'iResolution');
    glBgColorLocationRef.current = gl.getUniformLocation(program, 'uBackgroundColor');
    gl.uniform3fv(glBgColorLocationRef.current, new Float32Array(backgroundColor));

    let animationFrameId: number;
    const render = (time: number) => {
      gl.uniform1f(iTimeLoc, time * 0.001);
      gl.uniform2f(iResLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    animationFrameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full block z-0" style={{ backgroundColor: 'rgb(248, 249, 252)' }} />;
};


// --- EXPORTED Building Blocks --- //

export interface PricingCardProps {
  planName: string;
  description: string;
  price: string;
  currency: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: 'primary' | 'secondary';
  onAction?: () => void;
}

// Fix: PricingCard is now typed as React.FC<PricingCardProps> to ensure that React intrinsic props like 'key'
// are correctly handled when the component is used in JSX, resolving the "Property 'key' does not exist" error.
export const PricingCard: React.FC<PricingCardProps> = ({
  planName, description, price, currency, features, buttonText, isPopular = false, buttonVariant = 'primary', onAction
}) => {
  const cardClasses = `
    backdrop-blur-[24px] bg-white/40 dark:bg-black/40 rounded-[40px] shadow-2xl flex-1 w-full max-w-sm px-8 py-10 flex flex-col transition-all duration-500
    border border-white/50 dark:border-white/10
    hover:scale-105 hover:shadow-primary-500/10 hover:border-primary-200/50
    ${isPopular ? 'scale-105 relative ring-4 ring-primary-500/10 border-primary-500/30' : ''}
  `;
  
  const buttonClasses = `
    mt-auto w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all
    ${buttonVariant === 'primary' 
      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/20 active:scale-95' 
      : 'bg-gray-900/5 hover:bg-gray-900/10 text-gray-900 border border-gray-900/10 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20'
    }
  `;

  return (
    <div className={cardClasses.trim()}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-primary-600 text-white shadow-lg">
          EN ÇOK TERCİH EDİLEN
        </div>
      )}
      <div className="mb-4">
        <h2 className="text-[32px] font-black tracking-tighter text-gray-900 dark:text-white leading-none">{planName}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium uppercase tracking-wider">{description}</p>
      </div>
      <div className="my-8 flex items-baseline gap-1">
        <span className="text-[56px] font-black text-gray-900 dark:text-white tracking-tighter leading-none">{currency}{price}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">/ay</span>
      </div>
      <div className="w-full mb-8 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent"></div>
      <ul className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300 mb-10">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="p-1 bg-green-100 dark:bg-green-500/20 rounded-lg shrink-0">
                <CheckIcon className="text-green-600 dark:text-green-400 w-3.5 h-3.5" />
            </div>
            <span className="font-medium leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      <RippleButton className={buttonClasses.trim()} onClick={onAction}>{buttonText}</RippleButton>
    </div>
  );
};


// --- EXPORTED Customizable Page Component --- //

interface ModernPricingPageProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  plans: PricingCardProps[];
  showAnimatedBackground?: boolean;
}

export const ModernPricingPage = ({
  title,
  subtitle,
  plans,
  showAnimatedBackground = true,
}: ModernPricingPageProps) => {
  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-black dark:text-white min-h-screen w-full overflow-x-hidden relative">
      {showAnimatedBackground && <ShaderCanvas />}
      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 py-24 sm:py-32">
        <div className="w-full max-w-5xl mx-auto text-center mb-20">
          <h1 className="text-[40px] sm:text-[56px] md:text-[80px] font-black leading-[1.1] tracking-tighter text-gray-900 dark:text-white font-sans uppercase">
            {title}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-8 justify-center items-stretch w-full max-w-6xl">
          {/* Fix: Explicitly passing props individually to PricingCard ensures strict typing is maintained
              while React.FC handles the internal management of the 'key' property during rendering. */}
          {plans.map((plan) => (
            <PricingCard 
              key={plan.planName} 
              planName={plan.planName}
              description={plan.description}
              price={plan.price}
              currency={plan.currency}
              features={plan.features}
              buttonText={plan.buttonText}
              isPopular={plan.isPopular}
              buttonVariant={plan.buttonVariant}
              onAction={plan.onAction}
            />
          ))}
        </div>
        
        <div className="mt-20 flex flex-col items-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Güvenli Ödeme & Kolay İptal</p>
            <div className="flex gap-6 opacity-40 grayscale">
                <span className="text-sm font-black italic">VISA</span>
                <span className="text-sm font-black italic">mastercard</span>
                <span className="text-sm font-black italic">AMEX</span>
                <span className="text-sm font-black italic">iYZiCO</span>
            </div>
        </div>
      </main>
    </div>
  );
};