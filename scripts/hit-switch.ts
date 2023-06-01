import { Wallet } from "ethers";
import VeaSdk from "@kleros/vea-sdk";
import env from "@kleros/vea-sdk/dist/utils/env";
import { Switch__factory } from "../typechain-types/";
const switchDeployment = require("../deployments/arbitrumGoerli/SwitchArbitrumGoerliToGoerli.json");

// Optional logger configuration
const loggerOptions = {
  transportTargetOptions: {
    target: "@logtail/pino",
    options: { sourceToken: env.require("LOGTAIL_TOKEN") },
    level: env.optional("LOG_LEVEL", "info"),
  },
};

// Create the Vea client
const vea = VeaSdk.ClientFactory.arbitrumGoerliToGoerliDevnet(
  env.require("ARBGOERLI_RPC"),
  env.require("GOERLI_RPC"),
  loggerOptions
);

const privateKey = env.require("PRIVATE_KEY");
const logger = vea.logger
logger.info("Environmental variables properly set 👍");

const main = async () => {
  const wallet = new Wallet(privateKey, vea.inboxProvider);
  const switchContract = Switch__factory.connect(
    switchDeployment.address,
    wallet
  );
  const switchTxn = await switchContract.turnOnLightBulb();
  const switchTxnMined = await switchTxn.wait()
  logger.info("Switch hit 🎚️:", switchTxn);
  logger.info("Tx mined: %O", switchTxnMined?.events && switchTxnMined.events[1].args);
  logger.debug(`Filtering on blockNumber: ${switchTxnMined.blockNumber}`);

  const timeNow = Math.floor(Date.now() / 1000);
  const eta = Math.ceil(timeNow / 1800) * 1800 - timeNow + 60;
  logger.info(
    `Waiting for Vea Devnet to Bridge Message. ETA ~ ${Math.floor(
      eta / 60
    )} min ${eta % 60} seconds`
  );
  await delay(eta * 1000);

  const logs = await switchContract.queryFilter(
    switchContract.filters.lightBulbToggled(),
    switchTxnMined.blockNumber,
    switchTxnMined.blockNumber
  );
  const messageId = logs[0].args.messageId.toNumber();
  logger.info(`Message ID: ${messageId}`);

  // Get the message proof and data
  const messageInfo = await vea.getMessageInfo(messageId);
  logger.info("Message Info: %O", messageInfo);

  // Relay the message
  const outboxWallet = new Wallet(privateKey, vea.outboxProvider);
  await vea.relay(messageInfo, outboxWallet);
  logger.info(`Message ID ${messageId} relayed ✅`);
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    VeaSdk.ClientFactory.logger.error(error);
    process.exit(1);
  });
