//third page for NFT trading
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

function WithDraw() {

    const navigate = useNavigate();

    const Purple = 'images/purple/1.png';
    const Orange = 'images/purple/2.png';

    const { account, library, chainId, } = useWeb3React();
    const [arrTokenId, setArrTokenId] = useState([]);
    const [activeImage, setActiveImage] = useState(null);
    const [registrationId, setRegistrationId] = useState(0);

    const [updateState, setUpdateState] = useState(false);

    useEffect(() => {
        (async () => {
            await initFunction();
        })();
    }, [account]);

    const initFunction = async () => {
        if (account && chainId && library) {
            setUpdateState(true);
            web3 = new Web3(library.provider);

            if (chainId !== 0x13881 && chainId !== 0x137) {
                return;
            }
            const metadata = CONTRACTS['NFTTradingContract'][chainId]?.abi;
            const addr = CONTRACTS['NFTTradingContract'][chainId]?.address;

            const NFTTrading = new web3.eth.Contract(metadata, addr);

            const arrPostedList = await NFTTrading.methods.getListBySeller(account).call();
            let tmp_arrPostedList = arrPostedList.filter(postedList => postedList.traded === false && postedList.withdrawn === false)

            // let arrTokenId = [];
            // for (let i = 0; i < arrPostedList; i++) {
            //     let tokenId = await NFTTrading.methods.tokenOfOwnerByIndex(account, i).call();
            //     arrTokenId.push(tokenId);
            // }

            // setArrTokenId(arrTokenId);
            // console.log(arrTokenId);

            setArrTokenId(tmp_arrPostedList);
            setUpdateState(false);
        }
    }

    const clickNFTFunc = async (i) => {
        setActiveImage(i.tokenId);
        setRegistrationId(i[0]);
        // setRegistrationId()
    }

    const withdraw = async () => {
        // activeImage
        setUpdateState(true);
        try {
            const metadata = CONTRACTS['NFTTradingContract'][chainId]?.abi;
            const addr = CONTRACTS['NFTTradingContract'][chainId]?.address;

            const NFTTrading = new web3.eth.Contract(metadata, addr);

            const arrPostedList = await NFTTrading.methods.withdraw(registrationId).send({ from: account });
            await initFunction();
        } catch (error)
        {
            console.log(error);
            await initFunction();
        }
        setUpdateState(false);
    }

    const back = async () => {
        window.location.href = '/';
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
                            {activeImage % 10 == 0 ?
                                <img className="" src={'images/purple/10.png'} />
                                :
                                <img className="" src={'images/purple/' + activeImage % 10 + '.png'} />
                            }
                        </div>

                        <div className="user-chose" data-aos="fade-right" data-aos-duration="2000">
                            LIVE TRADES
                        </div>
                        <div className="btn-group">
                            <Button variant="primary" className="withdraw_trade" onClick={withdraw} disabled={( activeImage == null || updateState == true ||  arrTokenId.length == 0 )? true : false}>WITHDRAW</Button>
                            <Button variant="secondary" className="withdraw_trade" onClick={back}>BACK</Button>
                        </div>

                    </Col>
                    <Col lg={7}>
                        <div className="about-image" data-aos="fade-left" data-aos-duration="2000">
                            <h2>YOUR POSTS :</h2>
                        </div>
                        <div className="bear_list">
                            <Row className="bear_list_row">
                                {updateState == true ?
                                    <>
                                        <div className="one_page">
                                            <div className="loading"><div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
                                        </div>
                                    </> :
                                    <>
                                        {
                                            arrTokenId.length != 0 ?
                                                <>
                                                    {arrTokenId.map((img, i) => (
                                                        <Col lg={4} key = {i} onClick={() => clickNFTFunc(img)}>
                                                            <img className={activeImage == img.tokenId ? "activeImage" : ""} src={'images/purple/' + (img.tokenId % 10 == 0 ? 10 : img.tokenId % 10) + '.png'} />
                                                            <div className="detail_nft">tokenid: {img.tokenId} &nbsp;&nbsp;&nbsp;trait color: {img.targetTraits.join(',')}</div>
                                                        </Col>
                                                    ))}
                                                </>
                                                :
                                                <>
                                                    <h1>There is no available Items you posted.</h1>
                                                </>
                                        }
                                    </>
                                }
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default WithDraw;

