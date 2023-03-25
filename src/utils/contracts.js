const NFTTrading = require("./abi/NFTTrading.json");
const NFT = require("./abi/nft.json");


export const CONTRACTS = {
  ['NFTTradingContract']: {
    137: {address: "0x49b3ec0adee8876449a760b68f0ee68af9eeb631", abi: NFTTrading, decimals: 18},
    80001: {address: "0xFd868F02B522AD681b6913Dae7759127EA7d599E", abi: NFTTrading, decimals: 18}
  },
  ['NFTContract']: {
    137: {address: "0xfd868f02b522ad681b6913dae7759127ea7d599e", abi: NFT, decimals: 18},
    80001: {address: "0x49b3eC0AdEe8876449A760B68F0eE68Af9EEb631", abi: NFT, decimals: 18}
  }
}

