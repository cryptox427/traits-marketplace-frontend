import AOS from 'aos';
import 'aos/dist/aos.css';

import Footer from "../../components/footer";

AOS.init();

function Home() {
    return (
        <div>
            <div className="section-seperater left"></div>
            <footer className="page-footer">
                <Footer />
            </footer>
        </div>
    );
}

export default Home;
