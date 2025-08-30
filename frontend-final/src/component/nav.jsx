import { Settings,Home,Blend,LayoutDashboard,Lightbulb    } from 'lucide-react';
import './css/nav.css'

const Nav = () => {
    return (
        <div className="nav">
            <div className="container"><Home /></div>
            <div className="container"><Blend /></div>
            <div className="container"><LayoutDashboard /></div>
            <div className="container"><Settings /></div>
            <div className="container"><Lightbulb/></div>
        </div>
    );
}

export default Nav;