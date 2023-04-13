import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  RSCValve,
  RSCValveFactory,
  RSCValveFactory__factory,
  TestToken,
  TestToken__factory,
} from "../typechain-types";
import { snapshot } from "./utils";

describe("RSCValve", function () {
  let rscValveFactory: RSCValveFactory,
    rscValve: RSCValve,
    snapId: string,
    testToken: TestToken,
    owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    addr3: SignerWithAddress,
    addr4: SignerWithAddress,
    addr5: SignerWithAddress;

  async function deployRSCValve(
    controller: any,
    distributors: any,
    isImmutableRecipients: any,
    isAutoNativeCurrencyDistribution: any,
    minAutoDistributeAmount: any,
    initialRecipients: any,
    percentages: any,
    creationId: any
  ) {
    const tx = await rscValveFactory.createRSCValve({
      controller,
      distributors,
      isImmutableRecipients,
      isAutoNativeCurrencyDistribution,
      minAutoDistributeAmount,
      initialRecipients,
      percentages,
      creationId,
    });
    const receipt = await tx.wait();
    const revenueShareContractAddress = receipt.events?.[3].args?.[0];
    const RevenueShareContract = await ethers.getContractFactory("RSCValve");
    const RSCValve = await RevenueShareContract.attach(
      revenueShareContractAddress
    );
    return RSCValve;
  }

  before(async () => {
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    rscValveFactory = await new RSCValveFactory__factory(owner).deploy();
    rscValve = await deployRSCValve(
      owner.address,
      [owner.address],
      false,
      true,
      ethers.utils.parseEther("1"),
      [addr1.address],
      [10000000],
      ethers.constants.HashZero
    );
    testToken = await new TestToken__factory(owner).deploy();
    await testToken.deployed();
    await testToken.setMinter(owner.address);
  });

  beforeEach(async () => {
    snapId = await snapshot.take();
  });

  afterEach(async () => {
    await snapshot.restore(snapId);
  });

  it("Should set base attrs correctly", async () => {
    expect(await rscValve.owner()).to.be.equal(owner.address);
    expect(await rscValve.distributors(owner.address)).to.be.true;

    expect(await rscValve.isAutoNativeCurrencyDistribution()).to.be.true;
    await rscValve.setAutoNativeCurrencyDistribution(false);
    expect(await rscValve.isAutoNativeCurrencyDistribution()).to.be.false;
    await expect(
      rscValve.connect(addr1).setAutoNativeCurrencyDistribution(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    expect(await rscValve.isImmutableRecipients()).to.be.false;
    await expect(
      rscValve.connect(addr1).setImmutableRecipients()
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await rscValve.setImmutableRecipients();
    expect(await rscValve.isImmutableRecipients()).to.be.true;
    await expect(
      rscValve.setImmutableRecipients()
    ).to.be.revertedWithCustomError(rscValve, "ImmutableRecipientsError");

    expect(await rscValve.minAutoDistributionAmount()).to.be.equal(
      ethers.utils.parseEther("1")
    );
    await rscValve.setMinAutoDistributionAmount(ethers.utils.parseEther("2"));
    expect(await rscValve.minAutoDistributionAmount()).to.be.equal(
      ethers.utils.parseEther("2")
    );

    await expect(
      rscValve
        .connect(addr1)
        .setMinAutoDistributionAmount(ethers.utils.parseEther("2"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should set recipients correctly", async () => {
    await expect(
      rscValve
        .connect(addr3)
        .setRecipients(
          [addr1.address, addr3.address, addr4.address],
          [2000000, 5000000, 3000000],
          0
        )
    ).to.be.revertedWithCustomError(rscValve, "OnlyControllerError");

    await rscValve.setRecipients(
      [addr1.address, addr3.address, addr4.address],
      [2000000, 5000000, 3000000],
      0
    );

    expect(await rscValve.recipients(0, 0)).to.be.equal(addr1.address);
    expect(await rscValve.recipients(0, 1)).to.be.equal(addr3.address);
    expect(await rscValve.recipients(0, 2)).to.be.equal(addr4.address);
    expect(await rscValve.recipientsPercentage(0, addr1.address)).to.be.equal(
      2000000
    );
    expect(await rscValve.recipientsPercentage(0, addr3.address)).to.be.equal(
      5000000
    );
    expect(await rscValve.recipientsPercentage(0, addr4.address)).to.be.equal(
      3000000
    );
    expect(await rscValve.numberOfRecipients(0)).to.be.equal(3);

    await expect(
      rscValve.setRecipients(
        [addr1.address, addr3.address, addr4.address],
        [2000000, 5000000, 2000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "InvalidPercentageError");

    expect(await rscValve.recipients(0, 0)).to.be.equal(addr1.address);
    expect(await rscValve.recipients(0, 1)).to.be.equal(addr3.address);
    expect(await rscValve.recipients(0, 2)).to.be.equal(addr4.address);
    expect(await rscValve.recipientsPercentage(0, addr1.address)).to.be.equal(
      2000000
    );
    expect(await rscValve.recipientsPercentage(0, addr3.address)).to.be.equal(
      5000000
    );
    expect(await rscValve.recipientsPercentage(0, addr4.address)).to.be.equal(
      3000000
    );
    expect(await rscValve.numberOfRecipients(0)).to.be.equal(3);

    await rscValve.setRecipients(
      [addr5.address, addr4.address, addr3.address, addr1.address],
      [2000000, 2000000, 3000000, 3000000],
      0
    );

    expect(await rscValve.recipients(0, 0)).to.be.equal(addr5.address);
    expect(await rscValve.recipients(0, 1)).to.be.equal(addr4.address);
    expect(await rscValve.recipients(0, 2)).to.be.equal(addr3.address);
    expect(await rscValve.recipients(0, 3)).to.be.equal(addr1.address);
    expect(await rscValve.recipientsPercentage(0, addr5.address)).to.be.equal(
      2000000
    );
    expect(await rscValve.recipientsPercentage(0, addr4.address)).to.be.equal(
      2000000
    );
    expect(await rscValve.recipientsPercentage(0, addr3.address)).to.be.equal(
      3000000
    );
    expect(await rscValve.recipientsPercentage(0, addr1.address)).to.be.equal(
      3000000
    );
    expect(await rscValve.numberOfRecipients(0)).to.be.equal(4);

    await rscValve.setController(ethers.constants.AddressZero);

    await expect(
      rscValve.setRecipients(
        [addr1.address, addr3.address, addr4.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "OnlyControllerError");
  });

  it("InconsistentDataLengthError()", async () => {
    await expect(
      rscValve.setRecipients(
        [addr1.address, addr3.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "InconsistentDataLengthError");

    await expect(
      rscValve.setRecipients(
        [addr1.address, addr3.address, addr4.address],
        [2000000, 5000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "InconsistentDataLengthError");
  });

  it("NullAddressRecipientError()", async () => {
    await expect(
      rscValve.setRecipients(
        [addr1.address, ethers.constants.AddressZero],
        [5000000, 5000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "NullAddressRecipientError");
  });

  it("AmountMoreThanBalance()", async () => {
    await expect(
      rscValve.redistributeNativeCurrency(ethers.utils.parseEther("50"), 0)
    ).to.be.revertedWithCustomError(rscValve, "AmountMoreThanBalance");
  });

  it("Should set recipients correctly and set immutable recipients", async () => {
    await expect(
      rscValve
        .connect(addr3)
        .setRecipientsExt(
          [addr1.address, addr3.address, addr4.address],
          [2000000, 5000000, 3000000],
          0
        )
    ).to.be.revertedWithCustomError(rscValve, "OnlyControllerError");

    await rscValve.setRecipients(
      [addr1.address, addr3.address, addr4.address],
      [2000000, 5000000, 3000000],
      0
    );

    await expect(
      rscValve.setRecipientsExt(
        [addr1.address, addr3.address, addr4.address],
        [2000000, 5000000, 2000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "InvalidPercentageError");

    expect(await rscValve.recipients(0, 0)).to.be.equal(addr1.address);
    expect(await rscValve.recipients(0, 1)).to.be.equal(addr3.address);
    expect(await rscValve.recipients(0, 2)).to.be.equal(addr4.address);
    expect(await rscValve.recipientsPercentage(0, addr1.address)).to.be.equal(
      2000000
    );
    expect(await rscValve.recipientsPercentage(0, addr3.address)).to.be.equal(
      5000000
    );
    expect(await rscValve.recipientsPercentage(0, addr4.address)).to.be.equal(
      3000000
    );
    expect(await rscValve.numberOfRecipients(0)).to.be.equal(3);

    await rscValve.setRecipientsExt(
      [addr5.address, addr4.address, addr3.address, addr1.address],
      [2000000, 2000000, 3000000, 3000000],
      0
    );

    expect(await rscValve.recipients(0, 0)).to.be.equal(addr5.address);
    expect(await rscValve.recipients(0, 1)).to.be.equal(addr4.address);
    expect(await rscValve.recipients(0, 2)).to.be.equal(addr3.address);
    expect(await rscValve.recipients(0, 3)).to.be.equal(addr1.address);
    expect(await rscValve.recipientsPercentage(0, addr5.address)).to.be.equal(
      2000000
    );
    expect(await rscValve.recipientsPercentage(0, addr4.address)).to.be.equal(
      2000000
    );
    expect(await rscValve.recipientsPercentage(0, addr3.address)).to.be.equal(
      3000000
    );
    expect(await rscValve.recipientsPercentage(0, addr1.address)).to.be.equal(
      3000000
    );
    expect(await rscValve.numberOfRecipients(0)).to.be.equal(4);

    await expect(
      rscValve.setRecipientsExt(
        [addr1.address, addr3.address, addr4.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "ImmutableRecipientsError");

    await expect(
      rscValve.setRecipients(
        [addr1.address, addr3.address, addr4.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "ImmutableRecipientsError");
  });

  it("Should redistribute ETH correctly", async () => {
    await rscValve.setRecipients(
      [addr1.address, addr2.address],
      [8000000, 2000000],
      0
    );

    expect(await rscValve.numberOfRecipients(0)).to.be.equal(2);

    const addr1BalanceBefore = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();
    const addr2BalanceBefore = (
      await ethers.provider.getBalance(addr2.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: rscValve.address,
      value: ethers.utils.parseEther("50"),
    });
    rscValve.redistributeNativeCurrency(ethers.utils.parseEther("25"), 0);

    const addr1BalanceAfter = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();
    const addr2BalanceAfter = (
      await ethers.provider.getBalance(addr2.address)
    ).toBigInt();

    expect(addr1BalanceAfter).to.be.equal(
      addr1BalanceBefore + ethers.utils.parseEther("20").toBigInt()
    );
    expect(addr2BalanceAfter).to.be.equal(
      addr2BalanceBefore + ethers.utils.parseEther("5").toBigInt()
    );

    await owner.sendTransaction({
      to: rscValve.address,
      value: ethers.utils.parseEther("0.5"),
    });

    await rscValve.redistributeNativeCurrency(
      ethers.utils.parseEther("0.5"),
      0
    );

    expect(
      (await ethers.provider.getBalance(addr1.address)).toBigInt()
    ).to.be.equal(
      addr1BalanceAfter + ethers.utils.parseEther("0.4").toBigInt()
    );
    expect(
      (await ethers.provider.getBalance(addr2.address)).toBigInt()
    ).to.be.equal(
      addr2BalanceAfter + ethers.utils.parseEther("0.1").toBigInt()
    );
  });

  it("Should redistribute ERC20 token", async () => {
    await testToken.mint(rscValve.address, ethers.utils.parseEther("100"));

    await rscValve.setRecipients(
      [addr1.address, addr2.address],
      [2000000, 8000000],
      0
    );

    await rscValve.redistributeToken(
      testToken.address,
      ethers.utils.parseEther("100"),
      0
    );
    expect(await testToken.balanceOf(rscValve.address)).to.be.equal(0);
    expect(await testToken.balanceOf(addr1.address)).to.be.equal(
      ethers.utils.parseEther("20")
    );
    expect(await testToken.balanceOf(addr2.address)).to.be.equal(
      ethers.utils.parseEther("80")
    );

    await testToken.mint(rscValve.address, ethers.utils.parseEther("100"));

    await expect(
      rscValve
        .connect(addr3)
        .redistributeToken(testToken.address, ethers.utils.parseEther("100"), 0)
    ).to.be.revertedWithCustomError(rscValve, "OnlyDistributorError");

    await expect(
      rscValve.connect(addr3).setDistributor(addr3.address, true)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await rscValve.setDistributor(addr3.address, true);
    await rscValve
      .connect(addr3)
      .redistributeToken(testToken.address, ethers.utils.parseEther("100"), 0);

    expect(await testToken.balanceOf(rscValve.address)).to.be.equal(0);
    expect(await testToken.balanceOf(addr1.address)).to.be.equal(
      ethers.utils.parseEther("40")
    );
    expect(await testToken.balanceOf(addr2.address)).to.be.equal(
      ethers.utils.parseEther("160")
    );

    await expect(rscValve.renounceOwnership()).to.be.revertedWithCustomError(
      rscValve,
      "RenounceOwnershipForbidden"
    );
  });

  it("Should initialize only once", async () => {
    await expect(
      rscValve.initialize(
        addr2.address,
        ethers.constants.AddressZero,
        [owner.address],
        false,
        true,
        ethers.utils.parseEther("1"),
        BigInt(0),
        addr1.address,
        [addr1.address],
        [10000000]
      )
    ).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("Should transfer ownership correctly", async () => {
    await rscValve.transferOwnership(addr1.address);
    expect(await rscValve.owner()).to.be.equal(addr1.address);
    await expect(
      rscValve.connect(addr2).transferOwnership(addr2.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should create manual distribution split", async () => {
    const RSCValveManualDistribution = await deployRSCValve(
      owner.address,
      [owner.address],
      true,
      false,
      ethers.utils.parseEther("1"),
      [addr1.address, addr2.address],
      [5000000, 5000000],
      ethers.constants.HashZero
    );

    const addr1BalanceBefore = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: RSCValveManualDistribution.address,
      value: ethers.utils.parseEther("50"),
    });

    const contractBalance = (
      await ethers.provider.getBalance(RSCValveManualDistribution.address)
    ).toBigInt();
    expect(contractBalance).to.be.equal(ethers.utils.parseEther("50"));

    await expect(
      RSCValveManualDistribution.connect(addr3).redistributeNativeCurrency(
        ethers.utils.parseEther("50"),
        0
      )
    ).to.be.revertedWithCustomError(rscValve, "OnlyDistributorError");

    await RSCValveManualDistribution.redistributeNativeCurrency(
      ethers.utils.parseEther("50"),
      0
    );

    const contractBalance2 = (
      await ethers.provider.getBalance(RSCValveManualDistribution.address)
    ).toBigInt();
    expect(contractBalance2).to.be.equal(0);

    const addr1BalanceAfter = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();
    expect(addr1BalanceAfter).to.be.equal(
      addr1BalanceBefore + ethers.utils.parseEther("25").toBigInt()
    );
  });

  it("Should work with fees correctly", async () => {
    const RSCValveFeeFactory = await ethers.getContractFactory(
      "RSCValveFactory"
    );
    const rscValveFeeFactory = await RSCValveFeeFactory.deploy();
    await rscValveFeeFactory.deployed();

    await expect(
      rscValveFeeFactory.connect(addr1).setPlatformFee(BigInt(1))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      rscValveFeeFactory.setPlatformFee(BigInt(10000001))
    ).to.be.revertedWithCustomError(rscValveFeeFactory, "InvalidFeePercentage");

    await expect(
      rscValveFeeFactory.connect(addr1).setPlatformWallet(addr4.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await rscValveFeeFactory.setPlatformWallet(addr5.address);
    await rscValveFeeFactory.setPlatformFee(BigInt(5000000));

    expect(await rscValveFeeFactory.platformWallet()).to.be.equal(
      addr5.address
    );
    expect(await rscValveFeeFactory.platformFee()).to.be.equal(BigInt(5000000));

    const txFee = await rscValveFeeFactory.createRSCValve({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [addr1.address],
      percentages: [BigInt(10000000)],
      creationId: ethers.constants.HashZero,
    });
    const receipt = await txFee.wait();
    const revenueShareContractAddress = receipt.events?.[3].args?.[0];
    const RevenueShareContract = await ethers.getContractFactory("RSCValve");
    const rscFeeValve = await RevenueShareContract.attach(
      revenueShareContractAddress
    );

    const platformWalletBalanceBefore = (
      await ethers.provider.getBalance(addr5.address)
    ).toBigInt();
    const addr1BalanceBefore = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: rscFeeValve.address,
      value: ethers.utils.parseEther("50"),
    });
    await rscFeeValve.redistributeNativeCurrency(
      ethers.utils.parseEther("50"),
      0
    );

    const platformWalletBalanceAfter = (
      await ethers.provider.getBalance(addr5.address)
    ).toBigInt();
    const addr1BalanceAfter = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();

    expect(platformWalletBalanceAfter).to.be.equal(
      platformWalletBalanceBefore + ethers.utils.parseEther("25").toBigInt()
    );
    expect(addr1BalanceAfter).to.be.equal(
      addr1BalanceBefore + ethers.utils.parseEther("25").toBigInt()
    );

    await testToken.mint(rscFeeValve.address, ethers.utils.parseEther("100"));
    await rscFeeValve.redistributeToken(
      testToken.address,
      ethers.utils.parseEther("100"),
      0
    );

    expect(await testToken.balanceOf(addr5.address)).to.be.equal(
      ethers.utils.parseEther("50")
    );
    expect(await testToken.balanceOf(addr1.address)).to.be.equal(
      ethers.utils.parseEther("50")
    );
  });

  it("Should work with creation ID correctly", async () => {
    const RSCValveCreationIdFactory = await ethers.getContractFactory(
      "RSCValveFactory"
    );
    const rscValveCreationIdFactory = await RSCValveCreationIdFactory.deploy();
    await rscValveCreationIdFactory.deployed();

    await rscValveCreationIdFactory.createRSCValve({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [addr1.address],
      percentages: [BigInt(10000000)],
      creationId: ethers.utils.formatBytes32String("test-creation-id-1"),
    });

    await expect(
      rscValveCreationIdFactory.createRSCValve({
        controller: owner.address,
        distributors: [owner.address],
        isImmutableRecipients: true,
        isAutoNativeCurrencyDistribution: true,
        minAutoDistributeAmount: ethers.utils.parseEther("1"),
        initialRecipients: [addr1.address],
        percentages: [BigInt(10000000)],
        creationId: ethers.utils.formatBytes32String("test-creation-id-1"),
      })
    ).to.be.revertedWith("ERC1167: create2 failed");

    await rscValveCreationIdFactory.createRSCValve({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [addr1.address, addr2.address],
      percentages: [BigInt(5000000), BigInt(5000000)],
      creationId: ethers.utils.formatBytes32String("test-creation-id-1"),
    });

    await rscValveCreationIdFactory.createRSCValve({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [addr1.address],
      percentages: [BigInt(10000000)],
      creationId: ethers.utils.formatBytes32String("test-creation-id-2"),
    });
  });

  it("Should distribute small amounts correctly", async () => {
    await rscValve.setRecipients(
      [addr1.address, addr2.address],
      [2000000, 8000000],
      0
    );

    await testToken.mint(rscValve.address, BigInt(15000000));

    await rscValve.redistributeToken(testToken.address, BigInt(15000000), 0);
    expect(await testToken.balanceOf(addr1.address)).to.be.equal(
      BigInt(3000000)
    );
    expect(await testToken.balanceOf(addr2.address)).to.be.equal(
      BigInt(12000000)
    );
    expect(await testToken.balanceOf(rscValve.address)).to.be.equal(BigInt(0));

    await testToken.mint(rscValve.address, BigInt(15000000));

    await rscValve.redistributeToken(testToken.address, BigInt(15000000), 0);
    expect(await testToken.balanceOf(addr1.address)).to.be.equal(
      BigInt(6000000)
    );
    expect(await testToken.balanceOf(addr2.address)).to.be.equal(
      BigInt(24000000)
    );
    expect(await testToken.balanceOf(rscValve.address)).to.be.equal(BigInt(0));
  });

  it("Should distribute small ether amounts correctly", async () => {
    const rscValveXYZ = await deployRSCValve(
      owner.address,
      [owner.address],
      true,
      true,
      BigInt(10000000),
      [addr1.address, addr2.address],
      [5000000, 5000000],
      ethers.constants.HashZero
    );

    const addr1BalanceBefore1 = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();
    const addr2BalanceBefore1 = (
      await ethers.provider.getBalance(addr2.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: rscValveXYZ.address,
      value: ethers.utils.parseEther("0.000000000015"),
    });
    await rscValveXYZ.redistributeNativeCurrency(
      ethers.utils.parseEther("0.000000000015"),
      0
    );

    expect(
      (await ethers.provider.getBalance(addr1.address)).toBigInt()
    ).to.be.equal(
      addr1BalanceBefore1 +
        ethers.utils.parseEther("0.0000000000075").toBigInt()
    );
    expect(
      (await ethers.provider.getBalance(addr2.address)).toBigInt()
    ).to.be.equal(
      addr2BalanceBefore1 +
        ethers.utils.parseEther("0.0000000000075").toBigInt()
    );
    expect(
      (await ethers.provider.getBalance(rscValveXYZ.address)).toBigInt()
    ).to.be.equal(BigInt(0));

    const addr1BalanceBefore2 = (
      await ethers.provider.getBalance(addr1.address)
    ).toBigInt();
    const addr2BalanceBefore2 = (
      await ethers.provider.getBalance(addr2.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: rscValveXYZ.address,
      value: ethers.utils.parseEther("0.000000000015"),
    });
    await rscValveXYZ.redistributeNativeCurrency(
      ethers.utils.parseEther("0.000000000015"),
      0
    );

    expect(
      (await ethers.provider.getBalance(rscValveXYZ.address)).toBigInt()
    ).to.be.equal(BigInt(0));
    expect(
      (await ethers.provider.getBalance(addr1.address)).toBigInt()
    ).to.be.equal(
      addr1BalanceBefore2 +
        ethers.utils.parseEther("0.0000000000075").toBigInt()
    );

    expect(
      (await ethers.provider.getBalance(addr2.address)).toBigInt()
    ).to.be.equal(
      addr2BalanceBefore2 +
        ethers.utils.parseEther("0.0000000000075").toBigInt()
    );
  });
});
