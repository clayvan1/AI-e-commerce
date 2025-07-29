import ModeWrapper from '../ModeWrapper'

export function Lens({ modeProps = {}, ...props }) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      followPointer
      modeProps={modeProps}
      {...props}
    />
  )
}
