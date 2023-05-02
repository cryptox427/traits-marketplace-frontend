//second page for NFT trading
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import WalletConnect from "../../components/wallet/walletconnect";
import { useWeb3React } from '@web3-react/core';
import { ethers } from "ethers";
import Web3 from 'web3';
import axios from "axios";

import { CONTRACTS } from '../../utils/contracts';
import { CONSTANTS} from "../../utils/contants";

let web3;
const AboutImage = 'images/abossut-us.png';

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Details() {

    const query = useQuery();

    const { account, library, chainId, } = useWeb3React();
    const [regItem, setRegItem] = useState(null);
    const [arrRegistId, setArrRegistId] = useState([]);
    const [availableItems, setAvailableItems] = useState([]);
    const [activeAvailableItem, setActiveAvailableItem] = useState(null);
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
        try {
            if (account && chainId && library) {
                web3 = new Web3(library.provider);
                if (chainId !== 0x13881 && chainId !== 0x137) {
                    return;
                }
                setUpdateState(true);

                metadata1 = CONTRACTS['NFTContract'][chainId]?.abi;
                addr1 = CONTRACTS['NFTContract'][chainId]?.address;

                NFT = new web3.eth.Contract(metadata1, addr1);

                metadata2 = CONTRACTS['NFTTradingContract'][chainId]?.abi;
                addr2 = CONTRACTS['NFTTradingContract'][chainId]?.address;

                NFTTrading = new web3.eth.Contract(metadata2, addr2);

                const regId = query.get("regId");
                if (!regId) return;
                let registration = await NFTTrading.methods.getRegistration(regId).call();
                console.log(registration.targetTraits);

                const totalCountNFT = await NFT.methods.balanceOf(account).call();
                let arrTokenId = [];
                let promises = [];
                for (let i = 0; i < totalCountNFT; i++) {
                    const newPromise = new Promise(async resolve => {
                        let tokenId = await NFT.methods.tokenOfOwnerByIndex(account, i).call();
                        let url_temp = await NFT.methods.tokenURI(tokenId).call();
                        // const detailToken = url_temp.replace("0.json", "10.json");
                        const metadata_attr = (await axios.get(url_temp, {headers: {Accept: "text/plain"}})).data.attributes;
                        let color = "";
                        for (let j = 0; j < metadata_attr.length; j++) {
                            if (metadata_attr[j].trait_type.toLowerCase() === "color") {
                                color = metadata_attr[j].value;
                                break;
                            }
                        }
                        if (registration.targetTraits.includes(color)) {
                            arrTokenId.push({ 'id': tokenId, 'color': color });
                        }
                        resolve();
                    })
                    promises.push(newPromise);
                }
                Promise.all(promises).then(() => {
                    console.log('loaded', arrTokenId);
                    setAvailableItems(arrTokenId);
                })

                const metadataurl = await NFT.methods.tokenURI(registration.tokenId).call();
                const metadata_attr = (await axios.get(metadataurl, {headers: {Accept: "text/plain"}})).data.attributes;
                let color = "";
                for (let j = 0; j < metadata_attr.length; j++) {
                    if (metadata_attr[j].trait_type.toLowerCase() === "color") {
                        color = metadata_attr[j].value;
                        break;
                    }
                }

                if (registration.from) {
                    setRegItem({targetTraits: registration.targetTraits, id: registration.tokenId, color: color})
                    console.log('--', {targetTraits: registration.targetTraits, id: registration.tokenId, color: color})
                }

                setUpdateState(false);
            }
        } catch (e) {
            console.log(e)
            setUpdateState(false);
        }
    }

    const clickNFTFunc = async (data) => {
        setActiveAvailableItem({...data});
    }

    const actionTrade = async () => {
        try {
            console.log(activeAvailableItem)
        setUpdateState(true)
        let registId = query.get("regId");
        let tokenId = activeAvailableItem.id;
        let traits = activeAvailableItem.color;

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

        console.log(CONSTANTS.API_ENDPOINT + '/getSignature/' + account + '/' + registId + '/' + tokenId);

            let response = await axios.get(CONSTANTS.API_ENDPOINT + '/signature/trading?address=' + account + '&registrationid=' + registId + '&tokenid=' + tokenId);


            let resColor = response.data.resColor;
            let resSig = response.data.resSig.signature;
            console.log(resColor, resSig, registId, tokenId);

            metadata2 = CONTRACTS['NFTTradingContract'][chainId]?.abi;
            addr2 = CONTRACTS['NFTTradingContract'][chainId]?.address;

            NFTTrading = new web3.eth.Contract(metadata2, addr2);
            console.log('params----', registId, tokenId, resColor, resSig)

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
                            TRADE <br /> DETAILS
                        </div>
                        <div className="bear_list">
                            <Row className="bear_list_row">
                                {updateState === true ?
                                    <>
                                        <div className="one_page">
                                            <div className="loading"><div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
                                        </div>
                                    </> :
                                    <>
                                        {availableItems.length !== 0 ?
                                            <>
                                                {availableItems.map((data, i) => (
                                                    <Col lg={4} key = {i} onClick={() => clickNFTFunc(data)}>
                                                        <img className={activeAvailableItem?.id === data.id ? "activeImage" : ""} src={'images/nfts/' + data.color + '.png'} />
                                                        <div className="detail_nft">Token ID: {data.id}</div>
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
                        <div className="btn-group">
                            <Button variant="success" className="post_trade" onClick={actionTrade} disabled={updateState === true || activeAvailableItem === null}>REVIEW AND ACCEPT</Button>
                            <Button variant="warning" className="withdraw_trade" onClick={back}>BACK</Button>
                        </div>
                    </Col>
                    <Col lg={7}>
                        <div className="about-image" data-aos="fade-left" data-aos-duration="2000">
                            <h2>LIVE TRADES</h2>
                        </div>
                        <div className="bear_list">
                            <Row className="bear_list_row">
                                {updateState ?
                                    <>
                                        <div className="one_page">
                                            <div className="loading"><div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
                                        </div>
                                    </> :
                                    <>
                                        {
                                            regItem ?
                                                <>
                                                    <img src={'images/nfts/' + regItem.color + '.png'} height={'80%'} />
                                                    <div className="text-center">
                                                        <p>- Trading for {regItem.targetTraits.join(',')}</p>
                                                        <p>- Trades expires on </p>
                                                    </div>
                                                </> :
                                                <>
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

export default Details;
