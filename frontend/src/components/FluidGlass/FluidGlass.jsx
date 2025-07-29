import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, Preload } from '@react-three/drei'
import { useEffect } from 'react'
import { Lens } from './modes/Lens'
import { Bar } from './modes/Bar'
import { Cube } from './modes/Cube'
import NavItems from './NavItems'
import Typography from './visuals/Typography'
import Images from './visuals/Images'
import scrollbarStyle from './scrollbarStyle'

export default function FluidGlass({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {} }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = scrollbarStyle
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps
  const { navItems = [], ...modeProps } = rawOverrides

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      backgroundColor: 'transparent',
    }}>
      <ScrollControls damping={0.2} pages={2.6} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems} />}
        <Wrapper modeProps={modeProps}>
          <Scroll>
            <Typography />
            <Images />
          </Scroll>
          <Scroll html />
          <Preload />
        </Wrapper>
      </ScrollControls>
    </Canvas>
  )
}
