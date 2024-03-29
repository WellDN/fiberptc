import * as THREE from 'three'
import { useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree, extend, useLoader } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import glsl from 'babel-plugin-glsl/macro'

const PrototypeMaterial = shaderMaterial(
    //uniform use cases: pass mouse position data, Time information, Colors, Textures
    { uTime: 0, 
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: new THREE.Texture(),
 },
    //Vertex shader use cases: calculates/ manipulates the position of each individual vertex
    glsl`
    precision mediump float;
    varying vec2 vUv;
    varying float vWave;
    uniform float uTime;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
    void main() {
      vUv = uv;
      vec3 pos = position;
      float noiseFreq = 2.0;
      float noiseAmp = 0.4;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
    }
  `,
  // Fragment Shader : it sets the color of each individual fragment of the geometry
  glsl`
    precision mediump float;
    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying float vWave;
    void main() {
      float wave = vWave * 0.2;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(texture, 1.0); 
    }
  `
);

extend ({ PrototypeMaterial });

function ShaderPlane() {
  const ref = useRef()
  const { width, height} = useThree((state) => state.viewport)
  useFrame(({clock}) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, [
    "https://images.unsplash.com/photo-1604011092346-0b4346ed714e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80",
  ]);
  
  return (
    <mesh scale={[width, height, 1]}>

      <planeBufferGeometry />
      <prototypeMaterial uColor={"green"} ref={ref} uTexture={image}/>
    </mesh>
    
  )
}

export default function App() {
  return (
    <Canvas>
        <Suspense fallback={null}> 
      <ShaderPlane />
      </Suspense>
    </Canvas>
  )
}

