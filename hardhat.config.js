require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    mumbai: {
        url: "https://matic-mumbai.chainstacklabs.com",
        accounts: ["bb515f13802915b5fe96fbc0739d56d7b91cc1fae374fa5205fdc17662fb263e"],
        chainId: 80001
    },
    bsctestnet: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545",
        accounts: ["bb515f13802915b5fe96fbc0739d56d7b91cc1fae374fa5205fdc17662fb263e"],
        chainId: 97
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

};
