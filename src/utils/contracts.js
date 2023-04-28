const NFTTrading = require("./abi/NFTTrading.json");
const NFT = require("./abi/nft.json");
const NFTBreeding = require("./abi/NFTBreeding.json")

export const CONTRACTS = {
  ['NFTTradingContract']: {
    137: {address: "0x49b3ec0adee8876449a760b68f0ee68af9eeb631", abi: NFTTrading},
    80001: {address: "0x3A6B1Af1dFA32115cB9251f616559D40AB14fd00", abi: NFTTrading}
  },
  ['NFTContract']: {
    137: {address: "0xfd868f02b522ad681b6913dae7759127ea7d599e", abi: NFT},
    80001: {address: "0xc6237F81a4E638932369EEBF6128629E68754f82", abi: NFT}
  },
  ['NFTBreedingContract']: {
    80001: {address: "0x44556c443998De871346D7Ebf3D6ACC6cCd0512a", abi: NFTBreeding}
  }
}

