//second page for NFT trading
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import WalletConnect from "../../components/wallet/walletconnect";
import { useWeb3React } from '@web3-react/core';
import { ethers } from "ethers";
import Web3 from 'web3';

import { CONTRACTS } from '../../utils/contracts';

let web3;
const AboutImage = 'images/abossut-us.png';

function About() {

    const navigate = useNavigate();

    const Purple = 'images/purple/1.png';
    const Orange = 'images/purple/2.png';

    const { account, library, chainId, } = useWeb3React();
    const [ arrTokenId, setArrTokenId] = useState([]);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        (async () => {
            if (account && chainId && library) {
                web3 = new Web3(library.provider);

                if (chainId !== 0x13881 && chainId !== 0x137) {
                    return;
                }
                const metadata = CONTRACTS['NFTContract'][chainId]?.abi;
                const addr = CONTRACTS['NFTContract'][chainId]?.address;

                const NFT = new web3.eth.Contract(metadata, addr);

                const totalCountNFT = await NFT.methods.balanceOf(account).call();

                let arrTokenId = [];
                for (let i = 0; i < totalCountNFT; i++) {
                    let tokenId = await NFT.methods.tokenOfOwnerByIndex(account, i).call();
                    arrTokenId.push(tokenId);
                }

                setArrTokenId(arrTokenId);
            }
        })();
    }, [account]);

    const imgArray = ['Blue', 'Green', 'Cyan', 'Orange', 'Purple', 'Red', 'Yellow', 'Blue', 'Green', 'Cyan', 'Orange', 'Purple', 'Red', 'Yellow'];

    const clickNFTFunc = async (i) => {
        setActiveImage(i);
    }

    return (
        <div className="one_page">
            <Container fluid>
                <Row>
                    <Col lg={5}>
                        <div className="wallet-connect" data-aos="flip-up" data-aos-duration="2000">
                            <WalletConnect />
                        </div>
                        <div className="about-title" data-aos="fade-up" data-aos-duration="2000">
                            TRADE <br /> MARKET
                        </div>
                        <div className="about-string" data-aos="fade-right" data-aos-duration="2000">
                            PLEASE CLICK ON A<br /> BEAR TO REVIEW<br /> THE TRADE DETAILS
                        </div>
                        <div className="what_get">
                            {activeImage == 0?
                                <img className="" src={Orange} />
                                :
                                <img className="" src={'images/purple/' + activeImage + '.png'} />
                            }
                        </div>

                        <div className="user-chose" data-aos="fade-right" data-aos-duration="2000">
                            LIVE TRADES
                        </div>
                        <Button variant="secondary" className="post_trade" href = 'post'>REVIEW NFT AND ACCEPT TRADE</Button>

                    </Col>
                    <Col lg={7}>
                        <div className="about-image" data-aos="fade-left" data-aos-duration="2000">
                            <h2>YOUR BEARS:</h2>
                        </div>
                        <div className="bear_list">
                            <Row className="bear_list_row">
                                {arrTokenId.length != 0 ?
                                    <>
                                        {arrTokenId.map((img, i) => (
                                            <Col lg={4}  onClick={() => clickNFTFunc(img)}>
                                                <img src={'images/purple/' + img + '.png'} />
                                            </Col>
                                        ))}
                                    </>
                                    :
                                    <></>
                                }
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default About;
