import { useState, useEffect } from 'react'
import { Text } from '@react-three/drei'

export default function Typography() {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.7 },
  }

  const getDevice = () => {
    const w = window.innerWidth
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop'
  }

  const [device, setDevice] = useState(getDevice())

  useEffect(() => {
    const onResize = () => setDevice(getDevice())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { fontSize } = DEVICE[device]

  return (
    <Text
      position={[0, 0, 12]}
      font="/assets/fonts/figtreeblack.ttf"
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      GEE PLANET
    </Text>
  )
}
