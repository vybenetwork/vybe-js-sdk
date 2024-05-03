import { ForwardRefRenderFunction, ReactNode, forwardRef, useState } from 'react'

import { loadComponent } from './RemoteComponent'
import { VybeWidget } from 'src/types'

interface Props {
  children?: ReactNode
  type: VybeWidget
  props?: { [key: string]: any }
}

const LazyLoader: ForwardRefRenderFunction<HTMLElement, Props> = ({ children, props, type }, ref) => {
  const [remoteComp] = useState(loadComponent(type))

  if (remoteComp.Component === undefined) {
    throw new Promise<void>((resolve, reject) => {
      remoteComp.Component === undefined ? reject() : resolve()
    })
  }

  return (
    // @ts-ignore
    <remoteComp.Component ref={ref} props={props}>
      {children}
    </remoteComp.Component>
  )
}

LazyLoader.displayName = 'LazyLoader'

export default forwardRef<HTMLElement, Props>(LazyLoader)
