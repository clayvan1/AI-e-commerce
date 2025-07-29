import { useEffect, useState } from 'react'
import { Image, Text } from '@react-three/drei'

export default function Card({ position, title, body }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scaleFactor = isMobile ? 0.7 : 1

  return (
    <group position={position}>
      {/* Background panel */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.2 * scaleFactor, 1.2 * scaleFactor]} />
        <meshStandardMaterial color="#112244" opacity={0.7} transparent />
      </mesh>

      {/* Image at the top */}
      <Image
        position={[0, 0.6 * scaleFactor, 0.01]}
        scale={[0.5 * scaleFactor, 0.3 * scaleFactor, 1]}
        url="/assets/3d/ship.jpg"
      />

      {/* Title text */}
      <Text
        position={[0, 0.25 * scaleFactor, 0.02]}
        fontSize={0.1 * scaleFactor}
        maxWidth={1.1 * scaleFactor}
        anchorX="center"
        anchorY="middle"
        color="white"
      >
        {title}
      </Text>

      {/* Body text */}
      <Text
        position={[0, -0.2 * scaleFactor, 0.02]}
        fontSize={0.065 * scaleFactor}
        maxWidth={1.0 * scaleFactor}
        anchorX="center"
        anchorY="middle"
        color="#ccc"
      >
        {body}
      </Text>
    </group>
  )
}
