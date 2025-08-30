import { Settings, Home, Blend, LayoutDashboard, Lightbulb } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import './css/nav.css';
import { Link } from "react-router-dom";

const Nav = () => {
    return (
        <>
            <div className="nav">
                <div className="container" data-tooltip-id="nav-tooltip" data-tooltip-content="Home">
                    <Link to = "/"><Home/></Link>
                    
                </div>
                <div className="container" data-tooltip-id="nav-tooltip" data-tooltip-content="Inventory">
                    <Blend />
                </div>
                <div className="container" data-tooltip-id="nav-tooltip" data-tooltip-content="Dashboard">
                    <Link to = "/dashboard"><LayoutDashboard /></Link>
                </div>
                <div className="container" data-tooltip-id="nav-tooltip" data-tooltip-content="Settings">
                    <Settings />
                </div>
                <div className="container" data-tooltip-id="nav-tooltip" data-tooltip-content="AI Insights">
                    <Lightbulb />
                </div>
            </div>
            <Tooltip id="nav-tooltip" place="top" />
        </>
    );
}

export default Nav;