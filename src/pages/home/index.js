import AOS from 'aos';
import 'aos/dist/aos.css';

import About from "../../components/about";

AOS.init();

function Home() {
    return (
        <div>
            <section className="about" id="about">
                <About />
            </section>
           
        </div>
    );
}

export default Home;
