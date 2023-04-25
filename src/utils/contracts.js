const NFTTrading = require("./abi/NFTTrading.json");
const NFT = require("./abi/nft.json");
const NFTBreeding = require("./abi/NFTBreeding.json")

export const CONTRACTS = {
  ['NFTTradingContract']: {
    137: {address: "0x49b3ec0adee8876449a760b68f0ee68af9eeb631", abi: NFTTrading},
    80001: {address: "0x21878BE8C7407eEFFF332Fe406d5974CfeBA41a5", abi: NFTTrading}
  },
  ['NFTContract']: {
    137: {address: "0xfd868f02b522ad681b6913dae7759127ea7d599e", abi: NFT},
    80001: {address: "0x415fB929DA643ed326D746A3FbaA5E1e49186239", abi: NFT}
  },
  ['NFTBreedingContract']: {
    80001: {address: "0x123966F8e90eAD547De81AED3158D0F269D0AA1c", abi: NFTBreeding}
  }
}

