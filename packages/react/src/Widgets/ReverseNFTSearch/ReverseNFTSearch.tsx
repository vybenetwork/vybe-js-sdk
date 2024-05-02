import { WidgetProps } from 'src/types'

interface ReverseNFTSearchProps {
  title?: string
}

const ReverseNFTSearch = ({ children, props }: WidgetProps) => {
  const { title } = props as ReverseNFTSearchProps

  return (
    <div className="vybe-reverse-nft-search">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  )
}

export default ReverseNFTSearch
