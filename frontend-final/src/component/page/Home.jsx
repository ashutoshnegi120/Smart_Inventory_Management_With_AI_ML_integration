import Hero from "../hero.jsx";
import Features from "../Features.jsx";
import About from "../About.jsx";
import Contact from "../Contact.jsx";
import './Home.css'

const Home = () => {
    return (
        <div className="main-container">
            <Hero/>
            <Features/>
            <About/>
            <Contact />
        </div>
    );
}

export default Home;