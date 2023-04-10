const { ethers } = require("hardhat");

const provider = ethers.provider;

const VALVE_ADDRESS = "0x2138e3cBe3754Da55Be01c257ac02259FceE0e7a";

async function redistributeNativeToken() {
    const deployer = await ethers.getSigner();

    const Valve = await ethers.getContractAt(
        "XLARSCValve",
        VALVE_ADDRESS,
        provider.getSigner()
    );

    let temp = await deployer.sendTransaction({
        to: VALVE_ADDRESS,
        value: ethers.utils.parseEther("0.01")
    });
    await temp.wait();

    temp = await Valve.redistributeNativeToken(
        ethers.utils.parseEther("0.01"),
        0
    );
    await temp.wait();
    console.log("Success!");
}

redistributeNativeToken().then(() => process.exit(0)).catch(error => {
    console.log(error),
    process.exit(1)
})