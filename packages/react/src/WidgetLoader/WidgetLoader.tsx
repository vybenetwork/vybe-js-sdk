import { Suspense } from 'react'
import { VybeWidget, WidgetProps } from '../types'
import LazyLoader from './LazyLoader'

interface WidgetLoaderProps extends WidgetProps {
  widget: (typeof VybeWidget)[keyof typeof VybeWidget]
}

const WidgetLoader = ({ widget, children, props }: WidgetLoaderProps) => (
  <div className="vybe-widget-loader">
    <Suspense fallback={<div>Loading...</div>}>
      <LazyLoader type={widget} props={{ ...props, title: widget }}>
        {children}
      </LazyLoader>
    </Suspense>
  </div>
)

export default WidgetLoader
