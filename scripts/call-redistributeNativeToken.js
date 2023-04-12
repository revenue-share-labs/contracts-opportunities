const { ethers } = require("hardhat");

const provider = ethers.provider;

const VALVE_ADDRESS = "0x8c07644bA1cBdD48BE0fA4956274cf501033EA8D";

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
  let rc = await temp.wait();
  console.log(rc.hash);
  console.log("Success!");
}

redistributeNativeToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error), process.exit(1);
  });
