import { ethers } from "hardhat";

const provider = ethers.provider;

const VALVE_ADDRESS = "0xD554246BbD94112be4ea993beB5E3707Bd10BB92";

async function redistributeNativeToken() {
  const deployer = await ethers.getSigner();

  const Valve = await ethers.getContractAt(
    "RSCValve",
    VALVE_ADDRESS,
    provider.getSigner()
  );

  let temp = await deployer.sendTransaction({
    to: VALVE_ADDRESS,
    value: ethers.utils.parseEther("0.01"),
  });
  await temp.wait();

  temp = await Valve.redistributeNativeToken(
    ethers.utils.parseEther("0.01"),
    0
  );
  await temp.wait();
  console.log("Success!");
}

redistributeNativeToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error), process.exit(1);
  });
