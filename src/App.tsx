
import { useRoutes } from 'react-router-dom'
import './App.css'
import AdminLayout from './components/layouts/AdminLayout'
import Content from './components/layouts/Content'
import routes from './route'

function App() {
  const content = useRoutes(routes)

  return (
    <AdminLayout>
      <Content>
        {content}
      </Content>
    </AdminLayout>
  )
}

export default App
