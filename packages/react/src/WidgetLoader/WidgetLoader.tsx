import { Suspense, useContext } from 'react'
import VybeContext from 'src/context'
import { VybeWidget, WidgetProps } from 'src/types'

interface WidgetLoaderProps extends WidgetProps {
  widget: (typeof VybeWidget)[keyof typeof VybeWidget]
}

const WidgetLoader = ({ widget, children, props }: WidgetLoaderProps) => {
  const { availableWidgets } = useContext(VybeContext)

  const Component = availableWidgets[widget]
  if (!Component) {
    return <div>Component not available</div>
  }

  return (
    <div className="vybe-widget-loader">
      <Suspense fallback={<div>Loading...</div>}>
        <Component children={children} props={props || {}} />
      </Suspense>
    </div>
  )
}

export default WidgetLoader
