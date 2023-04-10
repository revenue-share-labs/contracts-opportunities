const { ethers } = require("hardhat");

const provider = ethers.provider;

const VALVE_ADDRESS = "0xD554246BbD94112be4ea993beB5E3707Bd10BB92";
const TOKEN = "0xb4C565edde995E771D174Ebb982af525e34eB1f5";

async function redistributeToken() {
    const deployer = await ethers.getSigner();

    const Valve = await ethers.getContractAt(
        "XLARSCValve",
        VALVE_ADDRESS,
        provider.getSigner()
    );

    const Token = await ethers.getContractAt(
        "Token",
        TOKEN,
        provider.getSigner()
    );
    
    let temp = await Token.transfer(
        VALVE_ADDRESS,
        ethers.utils.parseEther("1")
    );

    temp = await Valve.redistributeToken(
        TOKEN,
        ethers.utils.parseEther("1"),
        0
    );
    await temp.wait();
    
    console.log("Success!");
}

redistributeToken().then(() => process.exit(0)).catch(error => {
    console.log(error),
    process.exit(1)
})