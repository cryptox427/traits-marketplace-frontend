import AOS from 'aos';
import 'aos/dist/aos.css';

import Trading from "../../components/trading";

AOS.init();

function Trade() {
    return (
        <div>
            <section className="trade" id="trade">
                <Trading />
            </section>
        </div>
    );
}

export default Trade;
