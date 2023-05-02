//second page for NFT trading
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import WalletConnect from "../../components/wallet/walletconnect";
import { useWeb3React } from '@web3-react/core';
import { ethers } from "ethers";
import Web3 from 'web3';
import axios from "axios";

import { CONTRACTS } from '../../utils/contracts';

let web3;
const AboutImage = 'images/abossut-us.png';

function About() {

    const navigate = useNavigate();

    const API_URL = " http://localhost:8080/";

    const Purple = 'images/purple/1.png';
    const Orange = 'images/purple/2.png';

    const { account, library, chainId, } = useWeb3React();
    const [arrRegistId, setArrRegistId] = useState(null);
    const [arrRegistIdFilter, setArrRegistIdFilter] = useState([]);
    const [activeImage, setActiveImage] = useState(null);
    const [activeRegistId, setActiveRegistId] = useState(0);
    const [updateState, setUpdateState] = useState(false);
    let metadata1, addr1, metadata2, addr2, NFT, NFTTrading;

    useEffect(() => {
        (async () => {
            await initFunction();
        })();
    }, [account]);

    const initFunction = async () => {
        if (account && chainId && library) {
            web3 = new Web3(library.provider);
            if (chainId !== 0x13881 && chainId !== 0x137) {
                return;
            }

            // let tokenId = localStorage.getItem('registTokenId');
            // if (tokenId == null)
            //     return (<h1>Sorry, Can not find token Id. Please try again</h1>)
            metadata1 = CONTRACTS['NFTContract'][chainId]?.abi;
            addr1 = CONTRACTS['NFTContract'][chainId]?.address;

            NFT = new web3.eth.Contract(metadata1, addr1);
            //
            //
            // const tokenURI = await NFT.methods.tokenURI(tokenId).call();
            // // const detailToken = tokenURI.replace("0.json", "10.json");
            // const metadata_attr = (await axios.get(tokenURI)).data.attributes;
            //
            // let target_color = "";
            // for (let i = 0; i < metadata_attr.length; i++) {
            //     if (metadata_attr[i].trait_type.toLowerCase() === "color") {
            //         target_color = metadata_attr[i].value;
            //         break;
            //     }
            // }

            metadata2 = CONTRACTS['NFTTradingContract'][chainId]?.abi;
            addr2 = CONTRACTS['NFTTradingContract'][chainId]?.address;

            NFTTrading = new web3.eth.Contract(metadata2, addr2);
            let registratioins = await NFTTrading.methods.getRegistrationList().call();
            console.log(registratioins[0]);
            let arrRegistId = [];
            for (let i = 0; i < registratioins.length; i++) {
                if(registratioins[i]['traded'] === true || registratioins[i].from === account)
                    continue;
                let NFTcolor = "";
                const tokenNFTId = registratioins[i]['tokenId'];
                const tokenIdURI = await NFT.methods.tokenURI(tokenNFTId).call();
                const metadata_attr_2 = (await axios.get(tokenIdURI)).data.attributes;
                for (let i = 0; i < metadata_attr_2.length; i++) {
                    if (metadata_attr_2[i].trait_type.toLowerCase() === "color") {
                        NFTcolor = metadata_attr_2[i].value;
                        break;
                    }
                }

                    arrRegistId.push({ id: registratioins[i][0], tokenId: registratioins[i][3], color: NFTcolor });
            }

            setArrRegistId([...arrRegistId]);
            setArrRegistIdFilter(arrRegistId);
        }
    }

    const clickNFTFunc = async (data) => {
        setActiveRegistId(data.id);
        setActiveImage(data.color);
    }

    const actionTrade = async () => {
        window.location.href = `../details?regId=${activeRegistId}`
        setUpdateState(true)
        let registId = activeRegistId;
        let tokenId = localStorage.getItem('registTokenId');

        // await NFT.methods.approve()
        // await NFT.methods.approve(tradingAddr, activeBorder).send({from: account});
        metadata1 = CONTRACTS['NFTContract'][chainId]?.abi;
        addr1 = CONTRACTS['NFTContract'][chainId]?.address;
        addr2 = CONTRACTS['NFTTradingContract'][chainId]?.address;

        NFT = new web3.eth.Contract(metadata1, addr1);

        const approveState = await NFT.methods.getApproved(tokenId).call();

        if (approveState != addr2) {
            await NFT.methods.approve(addr2, tokenId).send({ from: account });
        }

        console.log(API_URL + 'getSignature/' + account + '/' + registId + '/' + tokenId);
        try {
            let response = await axios.get(API_URL + 'signature/trading?address=' + account + '&registrationid=' + registId + '&tokenid=' + tokenId);


            let resColor = response.data.resColor;
            let resSig = response.data.resSig.signature;
            console.log(resColor, resSig, registId, tokenId);

            metadata2 = CONTRACTS['NFTTradingContract'][chainId]?.abi;
            addr2 = CONTRACTS['NFTTradingContract'][chainId]?.address;

            NFTTrading = new web3.eth.Contract(metadata2, addr2);

            await NFTTrading.methods.buy(registId, tokenId, resColor, resSig).send({ from: account });
            console.log('successfully buy action done.');
            localStorage.removeItem('registTokenId');
            let temp_arr = arrRegistId.filter(registId => registId[0] != activeRegistId);
            setArrRegistId(temp_arr);
            setArrRegistIdFilter(temp_arr);
            setUpdateState(false);
        } catch (err) {
            console.log(err);
            setUpdateState(false);
            initFunction();
        }


        // const metadata2 = CONTRACTS['NFTTradingContract'][chainId]?.abi;
        // const addr2 = CONTRACTS['NFTTradingContract'][chainId]?.address;

        // const NFTTrading = new web3.eth.Contract(metadata2, addr2);


    }

    const back = async () => {
        window.location.href = '/';
    }

    const changeFilter = async (event) => {
        let filterString = event.target.value;
        if (filterString != 'All') {
            const arrRegistIdFilter = arrRegistId.filter(registId => registId.nftcolor == filterString);

            setArrRegistIdFilter(arrRegistIdFilter);
        }
        else {
            setArrRegistIdFilter(arrRegistId);
        }
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
                            {activeImage === null ?
                                <img className="" src={Orange} />
                                :
                                <img className="" src={'images/nfts/' + activeImage + '.png'} />
                            }
                        </div>

                        <div className="user-chose" data-aos="fade-right" data-aos-duration="2000">
                            YOU CHOSE
                        </div>
                        <div className="btn-group">
                            <Button variant="success" className="post_trade" onClick={actionTrade} disabled={updateState == true || activeRegistId == 0 ? true : false}>REVIEW AND ACCEPT</Button>
                            <Button variant="warning" className="withdraw_trade" onClick={back}>BACK</Button>
                        </div>
                    </Col>
                    <Col lg={7}>
                        <div className="about-image" data-aos="fade-left" data-aos-duration="2000">
                            <h2>LIVE TRADES</h2>
                        </div>
                        <div className="bear_list">
                            <Row className="bear_list_row">
                            {updateState === true || arrRegistId === null ?
                            <>
                                <div className="one_page">
                                    <div className="loading"><div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
                                </div>
                            </> :
                            <>
                                {arrRegistId.length !== 0 ?
                                    <>
                                        {arrRegistId.map((data, i) => (
                                            <Col lg={4} key = {i} onClick={() => clickNFTFunc(data)}>
                                                <img className={activeRegistId === data.id ? "activeImage" : ""} src={'images/nfts/' + data.color + '.png'} />
                                                <div className="detail_nft">Token ID: {data.tokenId}</div>
                                            </Col>
                                        ))}
                                    </>
                                    :
                                    <>
                                        <h1>There is no Items to display..</h1>
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

export default About;
