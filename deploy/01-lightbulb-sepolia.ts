import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import  getContractAddress  from "../deploy-helpers/getContractAddress";
import * as VeaOutboxArbToEthTestnet from "@kleros/vea-contracts/deployments/sepolia/VeaOutboxArbToEthTestnet.json";

const deployLightbulbSepolia: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { ethers, deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const deployer =
    (await getNamedAccounts()).deployer ??
    (await ethers.getSigners())[0].address;
  console.log("Deploying L1 Lightbulb on Sepolia 💡");
  const senderChainProvider = new ethers.JsonRpcProvider(
    process.env.ARBSEPOLIA_RPC
  );
  let nonce = await senderChainProvider.getTransactionCount(deployer);
  const lightBulbsSwitch = getContractAddress(deployer, nonce);
  const lightbulb = await deploy("LightbulbSepolia", {
    from: deployer,
    contract: "Lightbulb",
    args: [VeaOutboxArbToEthTestnet.address, lightBulbsSwitch],
    log: true,
  });

  console.log(`deployed to ${lightbulb.address}`);
};

deployLightbulbSepolia.skip = async ({ getChainId }) => {
  return Number(await getChainId()) != 11155111;
};

export default deployLightbulbSepolia;
