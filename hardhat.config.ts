import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "solidity-coverage";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.30",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
  },
  networks: {
    // Sender chain ---------------------------------------------------------------------------------
    arbitrumSepolia: {
      chainId: 421614,
      url: process.env.ARBSEPOLIA_RPC,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      companionNetworks: {
        chiado: "chiado",
        sepolia: "sepolia",
      },
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
    },
    chiado: {
      chainId: 10200,
      url: "https://rpc.chiadochain.net",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      tags: ["staging", "outbox", "layer1"],
      companionNetworks: {
        arbitrumSepolia: "arbitrumSepolia",
      },
      verify: {
        etherscan: {
          apiUrl: "https://blockscout.com/gnosis/chiado",
        },
      },
    },
    // Receiver chain ---------------------------------------------------------------------------------
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      live: true,
      saveDeployments: true,
      companionNetworks: {
        sender: "arbitrumSepolia",
      },
      verify: {
        etherscan: {
          apiKey: process.env.ETHERSCAN_API_KEY,
        },
      },
    },
  },
};

export default config;
