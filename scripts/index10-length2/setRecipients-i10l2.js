const { ethers } = require("hardhat");

const provider = ethers.provider;

const VALVE_ADDRESS = "0xBA60F6d45507A2CB5A7094C5329A4960E8D3D1F3";

const ADDRESSES = [
    "0x6829c091CfA40698dbB3Da56ea5E13b2c6BA38dc", 
    "0x687FA78988BCfDBB8C3FECB9cE66672F7651EDe1", 
    "0xE411Fed5cEdF4eB46FeB073dc4301943CEf042Af", 
    "0x237BE15533Ce301A7985d2B22F0b22D218570629",
    "0xcf817a559f8AfbfEeC554539fDA7A49d3bd24614",
    "0x177F6F419a79747D0F7f97f8C24f86746339a520",
    "0x0Fd0037379c9Df8642A0bd4468A7c2DE7Eb87200",
    "0xC3d2c243fD82a363C144c483E21167F4eED37ADf",
    "0x98f8B5F6B47F77B05fA59E23f97CD35fb7b9A865",
    "0x02d696593792391254192dF0310b63bC914bfB32"
];
const PERCENTAGE = 10000000;

async function setRecipients2() {
    const accounts = await ethers.getSigners();

    const Valve = await ethers.getContractAt(
        "XLARSCValve",
        VALVE_ADDRESS,
        provider.getSigner()
    );
    let percentage = [];

    for (let i = 0; i < 2; i++) {
        percentage.push(PERCENTAGE/2);
    }
    for (let i = 1; i < 11; i++) {
        let temp = await Valve.setRecipients(
            [ADDRESSES[0], ADDRESSES[1]],
            percentage,
            i
        );
        await temp.wait();
    }

    console.log("Success!");
}

setRecipients2().then(() => process.exit(0)).catch(error => {
    console.log(error),
    process.exit(1)
})