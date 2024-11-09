import { ReactNode } from "react"

interface ContentProps {
    children?: ReactNode
}

const Content: React.FC<ContentProps> = ({ children }) => (
    <div className='flex flex-col space-y-4 dark:text-cyan-50'>
        {children}
    </div>
)

export default Content
