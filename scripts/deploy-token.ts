import { ethers } from "hardhat";

async function main() {
  const token = await ethers.getContractFactory("Token");
  const Token = await token.deploy(
    "TEST",
    "TEST",
    ethers.utils.parseEther("1000000")
  );
  await Token.deployed();

  console.log(Token.address);
  console.log("Success!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error), process.exit(1);
  });
