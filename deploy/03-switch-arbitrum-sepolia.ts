import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as VeaInboxTestnetEthereum from "@kleros/vea-contracts/deployments/arbitrumSepolia/VeaInboxArbToEthTestnet.json";

const deploySwitches: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers,deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const deployer =
    (await getNamedAccounts()).deployer ??
    (await ethers.getSigners())[0].address;

  const LightBulbSepolia = await hre.companionNetworks.sepolia.deployments.get("LightbulbSepolia");
  console.log('Deploying Arbitrum Sepolia L2 Switch 🎚️ For Sepolia Lightbulb 💡')

  const switchToSepolia = await deploy("SwitchArbitrumSepoliaToSepolia", {
    from: deployer,
    contract: "Switch",
    args: [VeaInboxTestnetEthereum.address, LightBulbSepolia.address],
    log: true,
  });
  console.log("Switch deployed to: %s", switchToSepolia.address);  
};

deploySwitches.skip = async ({ getChainId }) => {
  return Number(await getChainId()) != 421614;
};
deploySwitches.runAtTheEnd = true;
deploySwitches.tags = ["switch-to-sepolia"];
export default deploySwitches;