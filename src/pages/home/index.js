import AOS from 'aos';
import 'aos/dist/aos.css';
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import WalletConnect from "../../components/wallet/walletconnect";
import { useWeb3React } from '@web3-react/core';
import Web3 from 'web3';
import axios from "axios";
import Select, {StylesConfig} from 'react-select';
import makeAnimated from 'react-select/animated';
import CreatableSelect from 'react-select/creatable';

import { CONTRACTS } from '../../utils/contracts';
import {CONSTANTS} from "../../utils/contants";

AOS.init();
let web3;

const Home = () => {

    const { account, library, chainId, } = useWeb3React();
    const [arrTokenId, setArrTokenId] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [activeTokenId, setActiveTokenId] = useState(0);

    const [trait, setTrait] = useState("Orange");
    const [traits, setTraits] = useState([]);
    const [checked, setChecked] = useState(1);

    // let metadata, addr, NFT;
    const colorOpts = [
        {value: "Blue", label: "Blue"},
        {value: "Green", label: "Green"},
        {value: "Orange", label: "Orange"},
        {value: "Purple", label: "Purple"},
        {value: "Red", label: "Red"},
        {value: "Yellow", label: "Yellow"},
        {value: "Cyan", label: "Cyan"},
    ]

    const animatedComponents = makeAnimated();

    useEffect(() => {
        (async () => {
            await initFunction();
        })();
    }, [account]);

    const initFunction = async () => {
        if (account && chainId && library) {
            web3 = new Web3(library.provider);

            if (chainId !== 0x13881 && chainId !== 0x89) {
                return;
            }
            const metadata = CONTRACTS['NFTContract'][chainId]?.abi;
            const addr = CONTRACTS['NFTContract'][chainId]?.address;

            const NFT = new web3.eth.Contract(metadata, addr);
            const totalCountNFT = await NFT.methods.balanceOf(account).call();
            console.log('balance--', totalCountNFT);
            let arrTokenId = [];
            let promises = [];
            for (let i = 0; i < totalCountNFT; i++) {
                const newPromise = new Promise(async resolve => {
                    let tokenId = await NFT.methods.tokenOfOwnerByIndex(account, i).call();
                    let url_temp = await NFT.methods.tokenURI(tokenId).call();
                    // const detailToken = url_temp.replace("0.json", "10.json");
                    console.log(url_temp)
                    const metadata_attr = (await axios.get(url_temp, {headers: {Accept: "text/plain"}})).data.attributes;
                    let color = "";
                    for (let j = 0; j < metadata_attr.length; j++) {
                        if (metadata_attr[j].trait_type.toLowerCase() === "color") {
                            color = metadata_attr[j].value;
                            break;
                        }
                    }
                    arrTokenId.push({ 'id': tokenId, 'color': color });
                    resolve();
                })
                promises.push(newPromise);
            }

            Promise.all(promises).then(() => {
                console.log('loaded');
                setArrTokenId(arrTokenId);
            })

        }
    }

    const onTraitChange = (val) => {
        console.log(val)
        const tempArr = val.map(a => a.value);
        setTraits([...tempArr]);
    }


    const clickNFTTrait = async (data) => {
        await localStorage.setItem('registTokenId', data.id);
        setActiveImage(data.color);
        setActiveTokenId(data.id);
    }

    const buyNewNFT = async () => {

        window.location.href = 'post';
    }

    const postTrade = async () => {
        setActiveImage(null);
        setActiveTokenId(0);
        setArrTokenId(null);
        try {
            const tradingAddr = CONTRACTS['NFTTradingContract'][chainId]?.address;
            const tradingABI = CONTRACTS['NFTTradingContract'][chainId]?.abi;
            const NFTTrading = new web3.eth.Contract(tradingABI, tradingAddr);

            const abi = CONTRACTS['NFTContract'][chainId]?.abi;
            const addr = CONTRACTS['NFTContract'][chainId]?.address;
            const NFT = new web3.eth.Contract(abi, addr);

            const approveState = await NFT.methods.getApproved(activeTokenId).call();

            if (approveState != tradingAddr) {
                await NFT.methods.approve(tradingAddr, activeTokenId).send({ from: account });
            }

            console.log('temp array----', traits, activeTokenId);

            await NFTTrading.methods.registerTrade(activeTokenId, traits).send({ from: account });
        } catch (err) {
            console.log(err);
        }
        await initFunction();
    }

    function onChangeMode(event) {
        setChecked(event.target.value);
    }

    const changeColor = async (event) => {
        setTrait(event.target.value);
    }

    return (
        <div className="one_page">
            <Container fluid>
                <Row>
                    <Col lg={4}>
                        <div className="wallet-connect" data-aos="flip-up" data-aos-duration="2000">
                            <WalletConnect />
                        </div>
                        <Container>
                            <div className="about-title" data-aos="fade-up" data-aos-duration="2000">
                                TRADE <br /> MARKET
                            </div>
                            <div className="about-string" data-aos="fade-right" data-aos-duration="2000">
                                PUT YOUR BEARS <br />FOR TRADE AND <br />COMPLETE YOUR <br />COLLECTION!
                            </div>
                            <div className="what_get">
                                {activeImage == null ?
                                    <img className="" src={'images/purple/10.png'} />
                                    :
                                    <img className="" src={'images/nfts/' + activeImage + '.png'} />
                                }
                            </div>

                            <div className="user-chose" data-aos="fade-right" data-aos-duration="2000">
                                YOUR CHOSE <Button variant="danger" className="goto_post" href="/my-post">Manage my posts</Button>
                            </div>
                            <div className="form-check form-check-inline" onChange={onChangeMode}>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" readOnly value="1" checked={checked == 1 ? "true" : ""} />
                                    <label className="form-check-label" htmlFor="inlineRadio1">Browse Trading Posts</label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" readOnly id="inlineRadio2" value="2" />
                                    <label className="form-check-label" htmlFor="inlineRadio2">Regist For Sale</label>
                                </div>
                            </div>

                            {/* <div className="btn-group"> */}
                            {checked == 1 ? <Button variant="primary" className="post_trade" onClick={buyNewNFT}>Browse Trading Posts</Button> : <></>}
                            {checked == 2 ?
                                <>
                                    {/*<select className="color_picker" onChange={changeColor} value={trait}>*/}
                                    {/*    <option value='Orange'>Orange</option>*/}
                                    {/*    <option value='Red'>Red</option>*/}
                                    {/*    <option value='Purple'>Purple</option>*/}
                                    {/*    <option value='Yellow'>Yellow</option>*/}
                                    {/*    <option value='Blue'>Blue</option>*/}
                                    {/*    <option value='Green'>Green</option>*/}
                                    {/*    <option value='Cyan'>Cyan</option>*/}
                                    {/*</select>*/}
                                    <CreatableSelect
                                        closeMenuOnSelect={false}
                                        components={animatedComponents}
                                        isMulti
                                        options={colorOpts}
                                        className={'custom-select'}
                                        onChange={onTraitChange}
                                    />
                                    <Button variant="success" className="post_trade" onClick={postTrade} disabled={activeImage == null ? true : false} >POST TRADE</Button>
                                </>
                                :
                                <></>
                            }
                            {/* </div> */}
                        </Container>
                        {/* href='' */}
                    </Col>
                    <Col lg={8}>
                        <div className="about-image" data-aos="fade-left" data-aos-duration="2000">
                            <h2>YOUR BEARS: </h2>
                        </div>
                        <div className="bear_list">
                            <Row className="bear_list_row">

                                {/* {imgArray.map((data, i) => (
                                <Col lg={4} >
                                <img src={'images/purple/1.png'} />
                                <div className="detail_nft">handsome</div>
                                </Col>
                            ))} */}

                                {arrTokenId == undefined ?
                                    <>
                                        <div className="loading"><div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
                                    </>
                                    :
                                    <>
                                        {arrTokenId.length != 0 ?
                                            <>
                                                {arrTokenId.map((data, i) => (
                                                    <Col lg={4} key = {i} onClick={() => clickNFTTrait(data)}>
                                                        <img className={activeTokenId == data.id ? "activeImage" : ""} src={'images/nfts/' + data.color + '.png'} />
                                                        <div className="detail_nft">tokenid: {data.id} &nbsp;&nbsp;&nbsp;color: {data.color}</div>
                                                    </Col>
                                                ))}
                                            </>
                                            :
                                            <>
                                                <div style={{marginTop:"80px"}}>There is no NFTs you mint at moment. You'd better mint your own NFTs first.</div>
                                                {/* <div className="loading"><div className ="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div> */}

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

export default Home;
