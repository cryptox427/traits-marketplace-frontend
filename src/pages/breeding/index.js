//first page for NFT trading
import React from "react";
import {useNavigate} from "react-router-dom";
import {useState, useContext, useEffect} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import WalletConnect from "../../components/wallet/walletconnect";
import {useWeb3React} from '@web3-react/core';
import {ethers} from "ethers";
import Web3 from 'web3';
import axios from "axios";

import {CONTRACTS} from '../../utils/contracts';
import {CONSTANTS} from "../../utils/contants";

let web3;

function Breeding() {

    const {account, library, chainId,} = useWeb3React();
    const [arrTokenId, setArrTokenId] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [activeTokenIds, setActiveTokenIds] = useState([]);
    const [activeTokenColors, setActiveTokenColors] = useState([]);
    const [activeTokenChakras, setActiveTokenChakras] = useState([]);

    const [breedingType, setBreedingType] = useState("color");
    const [loading, setLoading] = useState(false);



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
                const newPromise = new Promise((async resolve => {
                    let tokenId = await NFT.methods.tokenOfOwnerByIndex(account, i).call();
                    let url_temp = await NFT.methods.tokenURI(tokenId).call();
                    // const detailToken = url_temp.replace("0.json", "10.json");
                    console.log(url_temp)
                    const metadata_attr = (await axios.get(url_temp, {headers: {Accept: "text/plain"}})).data.attributes;
                    let color = "", chakra = "";
                    for (let j = 0; j < metadata_attr.length; j++) {
                        if (metadata_attr[j].trait_type.toLowerCase() === "color") {
                            color = metadata_attr[j].value;
                        }
                        if (metadata_attr[j].trait_type.toLowerCase() === "chakra") {
                            chakra = metadata_attr[j].value;
                        }
                    }
                    arrTokenId.push({'id': parseInt(tokenId), color, chakra});
                    resolve();
                }))
                promises.push(newPromise);
            }
            Promise.all(promises).then(() => {
                console.log('loaded');
                setArrTokenId(arrTokenId);
            })
        }
    }


    const clickNFTTrait = async (data) => {
        if (activeTokenIds.includes(data.id)) {
            const tempArr1 = activeTokenIds;
            const tempArr2 = activeTokenColors;
            const tempArr3 = activeTokenChakras;
            const index = tempArr1.indexOf(data.id)
            tempArr1.splice(index, 1);
            tempArr2.splice(index, 1);
            tempArr3.splice(index, 1);
            setActiveTokenIds([...tempArr1]);
            setActiveTokenColors([...tempArr2]);
            setActiveTokenChakras([...tempArr3]);
        } else {
            if (breedingType === "color" && activeTokenColors.includes(data.color)) return;
            if (breedingType === "chakra" && activeTokenChakras.includes(data.chakra)) return;
            setActiveTokenIds([...activeTokenIds, data.id]);
            setActiveTokenColors([...activeTokenColors, data.color]);
            setActiveTokenChakras([...activeTokenChakras, data.chakra]);
        }
    }

    const breed = async () => {
        if (activeTokenIds.length !== 7) return;
        try {
            setLoading(true);
            const breedingAddr = CONTRACTS['NFTBreedingContract'][chainId]?.address;
            const breedingABI = CONTRACTS['NFTBreedingContract'][chainId]?.abi;
            const NFTBreeding = new web3.eth.Contract(breedingABI, breedingAddr);

            const abi = CONTRACTS['NFTContract'][chainId]?.abi;
            const addr = CONTRACTS['NFTContract'][chainId]?.address;
            const NFT = new web3.eth.Contract(abi, addr);

            let url;
            if (breedingType === 'color') {
                url = `${CONSTANTS.API_ENDPOINT}/signature/breedingV1?address=${account}&type=1&ids=${activeTokenIds}`;
            } else {
                url = `${CONSTANTS.API_ENDPOINT}/signature/breedingV2?address=${account}&type=2&ids=${activeTokenIds}`;
            }
            const response = await axios.get(url);
            if (response.data.success) {
                console.log(response.data.resSig.signature);
                const approveState = await NFT.methods.isApprovedForAll(account, breedingAddr).call();
                if (!approveState) {
                    await NFT.methods.setApprovalForAll(breedingAddr, true).send({from: account});
                }
                console.log('params---', activeTokenIds, response.data.resSig.signature, breedingType === "color" ? 1 : 2);
                await NFTBreeding.methods.breed(activeTokenIds, response.data.resSig.signature, breedingType === "color" ? 1 : 2).send({from: account})
            }

            await initFunction();
            setLoading(false);
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    }

    function onChangeMode(event) {
        setActiveTokenIds([]);
        setActiveTokenColors([]);
        setActiveTokenChakras([]);

        setBreedingType(event.target.value);
    }

    return (
        <div className="one_page">
            <Container fluid>
                <Row>
                    <Col lg={4}>
                        <div className="wallet-connect" data-aos="flip-up" data-aos-duration="2000">
                            <WalletConnect/>
                        </div>
                        <Container>
                            <div className="about-title" data-aos="fade-up" data-aos-duration="2000">
                                COMBINE <br/> & <br/> UPGRADE
                            </div>
                            <div className="about-string" data-aos="fade-right" data-aos-duration="2000">
                                SELECT 7 BEARS <br/>TO UPGRADE TO <br/>NEW BEAR!
                            </div>
                            <div className="what_get">
                                {activeImage == null ?
                                    <img className="" src={'images/purple/10.png'}/>
                                    :
                                    <img className="" src={'images/purple/' + activeImage + '.png'}/>
                                }
                            </div>

                            <div className="user-chose" data-aos="fade-right" data-aos-duration="2000">
                                YOUR CHOSE
                                {/*<Button variant="danger" className="goto_post" href="/my-post">Go to My Post Page</Button>*/}
                            </div>
                            <div className="form-check form-check-inline" onChange={onChangeMode}>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="inlineRadioOptions"
                                           id="inlineRadio1" readOnly value="color"
                                           checked={breedingType === "color" ? "true" : ""}/>
                                    <label className="form-check-label" htmlFor="inlineRadio1">Color Breeding</label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="inlineRadioOptions" readOnly
                                           id="inlineRadio2" value="chakra"/>
                                    <label className="form-check-label" htmlFor="inlineRadio2">Chakra Breeding</label>
                                </div>
                            </div>

                            <Button variant="success" className="post_trade" onClick={breed}
                                    disabled={activeTokenIds.length !== 7}>Breeding</Button>
                        </Container>
                        {/* href='' */}
                    </Col>
                    <Col lg={8}>
                        <div className="about-image" data-aos="fade-left" data-aos-duration="2000">
                            <h2>SELECTED BEARS: {activeTokenIds.length}</h2>
                        </div>
                        <div className="bear_list">
                            <Row className="bear_list_row">

                                {arrTokenId == undefined || loading ?
                                    <>
                                        <div className="loading">
                                            <div className="lds-spinner">
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                                <div></div>
                                            </div>
                                        </div>
                                    </>
                                    :
                                    <>
                                        {arrTokenId.length != 0 ?
                                            <>
                                                {arrTokenId.map((data, i) => (
                                                    <Col lg={4} key={i} onClick={() => clickNFTTrait(data)}>
                                                        <img
                                                            className={activeTokenIds.includes(data.id) ? "activeImage" : ""}
                                                            src={'images/nfts/' + data.color + '.png'}/>
                                                        {
                                                            breedingType === "color" ?
                                                                <div
                                                                    className="detail_nft">tokenid: {data.id} &nbsp;&nbsp;&nbsp;color: {data.color}</div>
                                                                : <div
                                                                    className="detail_nft">tokenid: {data.id} &nbsp;&nbsp;&nbsp;chakra: {data.chakra}</div>
                                                        }
                                                    </Col>
                                                ))}
                                            </>
                                            :
                                            <>
                                                <div style={{marginTop: "80px"}}>There is no NFTs you mint at moment.
                                                    You'd better mint your own NFTs first.
                                                </div>
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

export default Breeding;
