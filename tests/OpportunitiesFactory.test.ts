import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  OpportunitiesFactory,
  OpportunitiesFactory__factory,
} from "../typechain-types";
import { snapshot } from "./utils";

describe("OpportunitiesFactory", () => {
  let opportunitiesFactory: OpportunitiesFactory,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    snapId: string;

  before(async () => {
    [owner, alice] = await ethers.getSigners();
    opportunitiesFactory = await new OpportunitiesFactory__factory(
      owner
    ).deploy();
  });

  beforeEach(async () => {
    snapId = await snapshot.take();
  });

  afterEach(async () => {
    await snapshot.restore(snapId);
  });

  describe("Deployment", () => {
    it("Should set the correct owner of the contract", async () => {
      expect(await opportunitiesFactory.owner()).to.be.equal(owner.address);
    });

    it("Should deploy Opportunities Implementation", async () => {
      expect(await opportunitiesFactory.contractImplementation()).not.to.be
        .empty;
    });
  });

  describe("Ownership", () => {
    it("Only owner can renounce ownership", async () => {
      await expect(
        opportunitiesFactory.connect(alice).renounceOwnership()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Only owner can transfer ownership", async () => {
      await expect(
        opportunitiesFactory.connect(alice).transferOwnership(alice.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Predict deterministic address", () => {
    it("Predicts address correctly", async () => {
      const salt = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          [
            "address",
            "address[]",
            "bool",
            "bool",
            "uint256",
            "address[]",
            "uint256[]",
            "bytes32",
            "address",
          ],
          [
            owner.address,
            [owner.address],
            false,
            true,
            0,
            [owner.address],
            [10000000],
            ethers.constants.HashZero,
            owner.address,
          ]
        )
      );

      const creationCode = [
        "0x3d602d80600a3d3981f3363d3d373d3d3d363d73",
        (await opportunitiesFactory.contractImplementation())
          .replace(/0x/, "")
          .toLowerCase(),
        "5af43d82803e903d91602b57fd5bf3",
      ].join("");

      const create2Addr = ethers.utils.getCreate2Address(
        opportunitiesFactory.address,
        salt,
        ethers.utils.keccak256(creationCode)
      );

      expect(
        await opportunitiesFactory.predictDeterministicAddress(
          {
            controller: owner.address,
            distributors: [owner.address],
            isImmutableRecipients: false,
            isAutoNativeCurrencyDistribution: true,
            minAutoDistributeAmount: 0,
            initialRecipients: [owner.address],
            percentages: [10000000],
            creationId: ethers.constants.HashZero,
          },
          owner.address
        )
      ).to.be.equal(create2Addr);
    });
  });
});
