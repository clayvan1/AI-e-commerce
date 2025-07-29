import { useRef, useEffect, useState } from 'react'
import { Image, useScroll } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import Card from './Card'

export default function Images() {
  const group = useRef()
  const data = useScroll()
  const { height } = useThree((s) => s.viewport)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scaleFactor = isMobile ? 0.6 : 1

  
  const imagePositions = isMobile
    ? [
        [-1.2, 0, 0],         
        [1.2, 0, 3],          
        [-1.2, -height, 6],   
        [0, -height, 9],      
        [1.2, -height, 10.5], 
      ]
    : [
        [-2, 0, 0],
        [2, 0, 3],
        [-2.05, -height, 6],
        [-0.6, -height, 9],
        [0.75, -height, 10.5],
      ]

  useFrame(() => {
    group.current.children.slice(0, 5).forEach((img, i) => {
      const factor = i < 2 ? data.range(0, 1 / 3) : data.range(1.15 / 3, 1 / 3)
      img.material.zoom = 1 + factor / (i < 2 ? 3 : 2)
    })
  })

  return (
    <group ref={group}>
      <Image position={imagePositions[0]} scale={[3 * scaleFactor, height / 1.1 * scaleFactor, 4]} url="/assets/3d/at.jpg" />
      <Image position={imagePositions[1]} scale={3 * scaleFactor} url="/assets/3d/lip.jpg" />
      <Image position={imagePositions[2]} scale={[1 * scaleFactor, 3 * scaleFactor, 1]} url="/assets/3d/cello.jpg" />
      <Image position={imagePositions[3]} scale={[1 * scaleFactor, 2 * scaleFactor, 1]} url="/assets/3d/m.png" />
      <Image position={imagePositions[4]} scale={1.5 * scaleFactor} url="/assets/3d/ab.jpg" />

      <group position={[0, -height * 1.5, 10]}>
        {isMobile ? (
          // Stack cards vertically and center
          <>
            <Card
              position={[0, 1.2, 0]}
              title="🚀 Performance"
              body="Every product is crafted with care, tested for performance, and delivered with a promise: to serve you better than anyone else can."
            />
            <Card
              position={[0, 0, 0]}
              title="🌐 Access"
              body="No matter where you are, we bring the experience to you. Fast, reliable, and built to scale with your world — because true access means inclusion, speed, and freedom."
            />
            <Card
              position={[0, -1.2, 0]}
              title="🔒 Security"
              body="In a world full of risks, we make protection effortless. From purchase to delivery, your data and privacy are shielded by cutting-edge technology and human-first policies.."
            />
          </>
        ) : (
          // Spread cards horizontally
          <>
            <Card
              position={[-2, 0, 0]}
              title="🚀 Performance"
              body="Every product is crafted with care, tested for performance, and delivered with a promise: to serve you better than anyone else can."
            />
            <Card
              position={[0, 0, 0]}
              title="🌐 Access"
              body="No matter where you are, we bring the experience to you. Fast, reliable, and built to scale with your world — because true access means inclusion, speed, and freedom."
            />
            <Card
              position={[2, 0, 0]}
              title="🔒 Security"
              body="In a world full of risks, we make protection effortless. From purchase to delivery, your data and privacy are shielded by cutting-edge technology and human-first policies.."
            />
          </>
        )}
      </group>
    </group>
  )
}
