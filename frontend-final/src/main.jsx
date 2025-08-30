import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Nav from './component/nav.jsx'
import Home from './component/page/Home.jsx'


const App = () => {
    return (
      <>
          <Nav />
          <Home />
      </>
    );
}
export default App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
