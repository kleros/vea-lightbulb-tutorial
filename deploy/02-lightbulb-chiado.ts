import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import getContractAddress from "../deploy-helpers/getContractAddress";
import * as VeaOutboxArbToGnosisTestnet from "@kleros/vea-contracts/deployments/chiado/VeaOutboxArbToGnosisTestnet.json";

const deployLightbulbChiado: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { ethers, deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const deployer =
    (await getNamedAccounts()).deployer ??
    (await ethers.getSigners())[0].address;
  console.log("Deploying L1 Lightbulb on Chiado 💡");

  const senderChainProvider = new ethers.JsonRpcProvider(
    process.env.ARBGOERLI_RPC
  );

  let nonce = (await senderChainProvider.getTransactionCount(deployer)) + 1;
  const lightBulbsSwitch = getContractAddress(deployer, nonce);
  const lightbulb = await deploy("Lightbulb", {
    from: deployer,
    contract: "Lightbulb",
    args: [VeaOutboxArbToGnosisTestnet.address, lightBulbsSwitch],
    log: true,
  });

  console.log(`deployed to ${lightbulb.address}`);
};

deployLightbulbChiado.skip = async ({ getChainId }) => {
  return Number(await getChainId()) != 10200;
};

export default deployLightbulbChiado;

