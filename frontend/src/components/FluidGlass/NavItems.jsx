/* eslint-disable react/no-unknown-property */
import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function NavItems({ items }) {
  const group = useRef()
  const { viewport, camera } = useThree()

  // ✅ Default nav items if none are passed
  const defaultItems = [
    { label: 'Home', link: '/Home' },
    { label: 'About', link: '' },
    { label: 'Contact', link: '' },
    { label: 'Login', link: '/login' },
  ]
  items = items && items.length > 0 ? items : defaultItems

  // Device-based spacing and font size
  const DEVICE = {
    mobile: { spacing: 0.2, fontSize: 0.035 },
    tablet: { spacing: 0.24, fontSize: 0.045 },
    desktop: { spacing: 0.3, fontSize: 0.045 },
  }

  // ✅ Safe initial device detection
  const [device, setDevice] = useState(() => {
    const w = window.innerWidth
    if (w <= 639) return 'mobile'
    if (w <= 1023) return 'tablet'
    return 'desktop'
  })

  // ✅ Responsive behavior with no ESLint warnings
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w <= 639) setDevice('mobile')
      else if (w <= 1023) setDevice('tablet')
      else setDevice('desktop')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { spacing, fontSize } = DEVICE[device]

  useFrame(() => {
    if (!group.current) return
    const v = viewport.getCurrentViewport(camera, [0, 0, 15])
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1)

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing
    })
  })

  const handleNavigate = (link) => {
    if (!link) return
    link.startsWith('#')
      ? (window.location.hash = link)
      : (window.location.href = link)
  }

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/assets/fonts/figtreeblack.ttf"
          depthWrite={false}
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          depthTest={false}
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation()
            handleNavigate(link)
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  )
}
