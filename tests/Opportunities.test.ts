import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  Opportunities,
  OpportunitiesFactory,
  OpportunitiesFactory__factory,
  TestToken,
  TestToken__factory,
} from "../typechain-types";
import { snapshot } from "./utils";

describe("Opportunities", function () {
  let opportunitiesFactory: OpportunitiesFactory,
    opportunities: Opportunities,
    snapId: string,
    testToken: TestToken,
    owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    addr3: SignerWithAddress,
    addr4: SignerWithAddress,
    addr5: SignerWithAddress;

  async function deployOpportunities(
    controller: any,
    distributors: any,
    isImmutableRecipients: any,
    isAutoNativeCurrencyDistribution: any,
    minAutoDistributeAmount: any,
    initialRecipients: any,
    percentages: any,
    creationId: any
  ) {
    const tx = await opportunitiesFactory.createOpportunities({
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
    const RevenueShareContract = await ethers.getContractFactory(
      "Opportunities"
    );
    const Opportunities = await RevenueShareContract.attach(
      revenueShareContractAddress
    );
    return Opportunities;
  }

  before(async () => {
    [owner, alice, bob, addr3, addr4, addr5] = await ethers.getSigners();
    opportunitiesFactory = await new OpportunitiesFactory__factory(
      owner
    ).deploy();
    opportunities = await deployOpportunities(
      owner.address,
      [owner.address],
      false,
      true,
      ethers.utils.parseEther("1"),
      [alice.address],
      [10000000],
      ethers.constants.HashZero
    );
    testToken = await new TestToken__factory(owner).deploy();
    await testToken.deployed();
  });

  beforeEach(async () => {
    snapId = await snapshot.take();
  });

  afterEach(async () => {
    await snapshot.restore(snapId);
  });

  it("Should set base attrs correctly", async () => {
    expect(await opportunities.owner()).to.be.equal(owner.address);
    expect(await opportunities.distributors(owner.address)).to.be.true;

    expect(await opportunities.isAutoNativeCurrencyDistribution()).to.be.true;
    await opportunities.setAutoNativeCurrencyDistribution(false);
    expect(await opportunities.isAutoNativeCurrencyDistribution()).to.be.false;
    await expect(
      opportunities.connect(alice).setAutoNativeCurrencyDistribution(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    expect(await opportunities.isImmutableRecipients()).to.be.false;
    await expect(
      opportunities.connect(alice).setImmutableRecipients()
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await opportunities.setImmutableRecipients();
    expect(await opportunities.isImmutableRecipients()).to.be.true;
    await expect(
      opportunities.setImmutableRecipients()
    ).to.be.revertedWithCustomError(opportunities, "ImmutableRecipientsError");

    expect(await opportunities.minAutoDistributionAmount()).to.be.equal(
      ethers.utils.parseEther("1")
    );
    await opportunities.setMinAutoDistributionAmount(
      ethers.utils.parseEther("2")
    );
    expect(await opportunities.minAutoDistributionAmount()).to.be.equal(
      ethers.utils.parseEther("2")
    );

    await expect(
      opportunities
        .connect(alice)
        .setMinAutoDistributionAmount(ethers.utils.parseEther("2"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should set recipients correctly", async () => {
    await expect(
      opportunities
        .connect(addr3)
        .setRecipients(
          [alice.address, addr3.address, addr4.address],
          [2000000, 5000000, 3000000],
          0
        )
    ).to.be.revertedWithCustomError(opportunities, "OnlyControllerError");

    await opportunities.setRecipients(
      [alice.address, addr3.address, addr4.address],
      [2000000, 5000000, 3000000],
      0
    );

    expect(await opportunities.recipients(0, 0)).to.be.equal(alice.address);
    expect(await opportunities.recipients(0, 1)).to.be.equal(addr3.address);
    expect(await opportunities.recipients(0, 2)).to.be.equal(addr4.address);
    expect(
      await opportunities.recipientsPercentage(0, alice.address)
    ).to.be.equal(2000000);
    expect(
      await opportunities.recipientsPercentage(0, addr3.address)
    ).to.be.equal(5000000);
    expect(
      await opportunities.recipientsPercentage(0, addr4.address)
    ).to.be.equal(3000000);
    expect(await opportunities.numberOfRecipients(0)).to.be.equal(3);

    await expect(
      opportunities.setRecipients(
        [alice.address, addr3.address, addr4.address],
        [2000000, 5000000, 2000000],
        0
      )
    ).to.be.revertedWithCustomError(opportunities, "InvalidPercentageError");

    expect(await opportunities.recipients(0, 0)).to.be.equal(alice.address);
    expect(await opportunities.recipients(0, 1)).to.be.equal(addr3.address);
    expect(await opportunities.recipients(0, 2)).to.be.equal(addr4.address);
    expect(
      await opportunities.recipientsPercentage(0, alice.address)
    ).to.be.equal(2000000);
    expect(
      await opportunities.recipientsPercentage(0, addr3.address)
    ).to.be.equal(5000000);
    expect(
      await opportunities.recipientsPercentage(0, addr4.address)
    ).to.be.equal(3000000);
    expect(await opportunities.numberOfRecipients(0)).to.be.equal(3);

    await opportunities.setRecipients(
      [addr5.address, addr4.address, addr3.address, alice.address],
      [2000000, 2000000, 3000000, 3000000],
      0
    );

    expect(await opportunities.recipients(0, 0)).to.be.equal(addr5.address);
    expect(await opportunities.recipients(0, 1)).to.be.equal(addr4.address);
    expect(await opportunities.recipients(0, 2)).to.be.equal(addr3.address);
    expect(await opportunities.recipients(0, 3)).to.be.equal(alice.address);
    expect(
      await opportunities.recipientsPercentage(0, addr5.address)
    ).to.be.equal(2000000);
    expect(
      await opportunities.recipientsPercentage(0, addr4.address)
    ).to.be.equal(2000000);
    expect(
      await opportunities.recipientsPercentage(0, addr3.address)
    ).to.be.equal(3000000);
    expect(
      await opportunities.recipientsPercentage(0, alice.address)
    ).to.be.equal(3000000);
    expect(await opportunities.numberOfRecipients(0)).to.be.equal(4);

    await opportunities.setController(ethers.constants.AddressZero);

    await expect(
      opportunities.setRecipients(
        [alice.address, addr3.address, addr4.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(opportunities, "OnlyControllerError");
  });

  it("InconsistentDataLengthError()", async () => {
    await expect(
      opportunities.setRecipients(
        [alice.address, addr3.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(
      opportunities,
      "InconsistentDataLengthError"
    );

    await expect(
      opportunities.setRecipients(
        [alice.address, addr3.address, addr4.address],
        [2000000, 5000000],
        0
      )
    ).to.be.revertedWithCustomError(
      opportunities,
      "InconsistentDataLengthError"
    );
  });

  it("NullAddressRecipientError()", async () => {
    await expect(
      opportunities.setRecipients(
        [alice.address, ethers.constants.AddressZero],
        [5000000, 5000000],
        0
      )
    ).to.be.revertedWithCustomError(opportunities, "NullAddressRecipientError");
  });

  it("AmountMoreThanBalance()", async () => {
    await expect(
      opportunities.redistributeNativeCurrency(ethers.utils.parseEther("50"), 0)
    ).to.be.revertedWithCustomError(opportunities, "AmountMoreThanBalance");
  });

  it("RenounceOwnershipForbidden()", async () => {
    await expect(
      opportunities.renounceOwnership()
    ).to.be.revertedWithCustomError(
      opportunities,
      "RenounceOwnershipForbidden"
    );
  });

  it("TooLowBalanceToRedistribute()", async () => {
    await opportunities.setRecipients(
      [alice.address, bob.address],
      [2000000, 8000000],
      0
    );

    // With tokens
    const amountToDistribute = ethers.utils.parseEther("0.000000000001");
    await testToken.mint(opportunities.address, amountToDistribute);

    await expect(
      opportunities.redistributeToken(
        testToken.address,
        ethers.utils.parseEther("0.000000000001"),
        0
      )
    ).to.be.revertedWithCustomError(
      opportunities,
      "TooLowBalanceToRedistribute"
    );
    expect(await testToken.balanceOf(opportunities.address)).to.be.equal(
      amountToDistribute
    );
    expect(await testToken.balanceOf(alice.address)).to.be.equal(0);
    expect(await testToken.balanceOf(bob.address)).to.be.equal(0);

    // With ether
    const aliceBalanceBefore = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();
    const bobBalanceBefore = (
      await ethers.provider.getBalance(bob.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: opportunities.address,
      value: ethers.utils.parseEther("0.000000000001"),
    });
    await expect(
      opportunities.redistributeNativeCurrency(
        ethers.utils.parseEther("0.000000000001"),
        0
      )
    ).to.be.revertedWithCustomError(
      opportunities,
      "TooLowBalanceToRedistribute"
    );

    const aliceBalanceAfter = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();
    const bobBalanceAfter = (
      await ethers.provider.getBalance(bob.address)
    ).toBigInt();
    expect(aliceBalanceAfter).to.be.equal(aliceBalanceBefore);
    expect(bobBalanceAfter).to.be.equal(bobBalanceBefore);
  });

  it("Should set recipients correctly and set immutable recipients", async () => {
    await expect(
      opportunities
        .connect(addr3)
        .setRecipientsExt(
          [alice.address, addr3.address, addr4.address],
          [2000000, 5000000, 3000000],
          0
        )
    ).to.be.revertedWithCustomError(opportunities, "OnlyControllerError");

    await opportunities.setRecipients(
      [alice.address, addr3.address, addr4.address],
      [2000000, 5000000, 3000000],
      0
    );

    await expect(
      opportunities.setRecipientsExt(
        [alice.address, addr3.address, addr4.address],
        [2000000, 5000000, 2000000],
        0
      )
    ).to.be.revertedWithCustomError(opportunities, "InvalidPercentageError");

    expect(await opportunities.recipients(0, 0)).to.be.equal(alice.address);
    expect(await opportunities.recipients(0, 1)).to.be.equal(addr3.address);
    expect(await opportunities.recipients(0, 2)).to.be.equal(addr4.address);
    expect(
      await opportunities.recipientsPercentage(0, alice.address)
    ).to.be.equal(2000000);
    expect(
      await opportunities.recipientsPercentage(0, addr3.address)
    ).to.be.equal(5000000);
    expect(
      await opportunities.recipientsPercentage(0, addr4.address)
    ).to.be.equal(3000000);
    expect(await opportunities.numberOfRecipients(0)).to.be.equal(3);

    await opportunities.setRecipientsExt(
      [addr5.address, addr4.address, addr3.address, alice.address],
      [2000000, 2000000, 3000000, 3000000],
      0
    );

    expect(await opportunities.recipients(0, 0)).to.be.equal(addr5.address);
    expect(await opportunities.recipients(0, 1)).to.be.equal(addr4.address);
    expect(await opportunities.recipients(0, 2)).to.be.equal(addr3.address);
    expect(await opportunities.recipients(0, 3)).to.be.equal(alice.address);
    expect(
      await opportunities.recipientsPercentage(0, addr5.address)
    ).to.be.equal(2000000);
    expect(
      await opportunities.recipientsPercentage(0, addr4.address)
    ).to.be.equal(2000000);
    expect(
      await opportunities.recipientsPercentage(0, addr3.address)
    ).to.be.equal(3000000);
    expect(
      await opportunities.recipientsPercentage(0, alice.address)
    ).to.be.equal(3000000);
    expect(await opportunities.numberOfRecipients(0)).to.be.equal(4);

    await expect(
      opportunities.setRecipientsExt(
        [alice.address, addr3.address, addr4.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(opportunities, "ImmutableRecipientsError");

    await expect(
      opportunities.setRecipients(
        [alice.address, addr3.address, addr4.address],
        [2000000, 5000000, 3000000],
        0
      )
    ).to.be.revertedWithCustomError(opportunities, "ImmutableRecipientsError");
  });

  it("Should redistribute ETH correctly", async () => {
    await opportunities.setRecipients(
      [alice.address, bob.address],
      [8000000, 2000000],
      0
    );

    expect(await opportunities.numberOfRecipients(0)).to.be.equal(2);

    const aliceBalanceBefore = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();
    const bobBalanceBefore = (
      await ethers.provider.getBalance(bob.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: opportunities.address,
      value: ethers.utils.parseEther("50"),
    });
    opportunities.redistributeNativeCurrency(ethers.utils.parseEther("25"), 0);

    const aliceBalanceAfter = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();
    const bobBalanceAfter = (
      await ethers.provider.getBalance(bob.address)
    ).toBigInt();

    expect(aliceBalanceAfter).to.be.equal(
      aliceBalanceBefore + ethers.utils.parseEther("20").toBigInt()
    );
    expect(bobBalanceAfter).to.be.equal(
      bobBalanceBefore + ethers.utils.parseEther("5").toBigInt()
    );

    await owner.sendTransaction({
      to: opportunities.address,
      value: ethers.utils.parseEther("0.5"),
    });

    await opportunities.redistributeNativeCurrency(
      ethers.utils.parseEther("0.5"),
      0
    );

    expect(
      (await ethers.provider.getBalance(alice.address)).toBigInt()
    ).to.be.equal(
      aliceBalanceAfter + ethers.utils.parseEther("0.4").toBigInt()
    );
    expect(
      (await ethers.provider.getBalance(bob.address)).toBigInt()
    ).to.be.equal(bobBalanceAfter + ethers.utils.parseEther("0.1").toBigInt());
  });

  it("Should redistribute ERC20 token", async () => {
    await testToken.mint(opportunities.address, ethers.utils.parseEther("100"));

    await opportunities.setRecipients(
      [alice.address, bob.address],
      [2000000, 8000000],
      0
    );

    await opportunities.redistributeToken(
      testToken.address,
      ethers.utils.parseEther("100"),
      0
    );
    expect(await testToken.balanceOf(opportunities.address)).to.be.equal(0);
    expect(await testToken.balanceOf(alice.address)).to.be.equal(
      ethers.utils.parseEther("20")
    );
    expect(await testToken.balanceOf(bob.address)).to.be.equal(
      ethers.utils.parseEther("80")
    );

    await testToken.mint(opportunities.address, ethers.utils.parseEther("100"));

    await expect(
      opportunities
        .connect(addr3)
        .redistributeToken(testToken.address, ethers.utils.parseEther("100"), 0)
    ).to.be.revertedWithCustomError(opportunities, "OnlyDistributorError");

    await expect(
      opportunities.connect(addr3).setDistributor(addr3.address, true)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await opportunities.setDistributor(addr3.address, true);
    await opportunities
      .connect(addr3)
      .redistributeToken(testToken.address, ethers.utils.parseEther("100"), 0);

    expect(await testToken.balanceOf(opportunities.address)).to.be.equal(0);
    expect(await testToken.balanceOf(alice.address)).to.be.equal(
      ethers.utils.parseEther("40")
    );
    expect(await testToken.balanceOf(bob.address)).to.be.equal(
      ethers.utils.parseEther("160")
    );

    await expect(
      opportunities.renounceOwnership()
    ).to.be.revertedWithCustomError(
      opportunities,
      "RenounceOwnershipForbidden"
    );
  });

  it("Should initialize only once", async () => {
    await expect(
      opportunities.initialize(
        bob.address,
        ethers.constants.AddressZero,
        [owner.address],
        false,
        true,
        ethers.utils.parseEther("1"),
        BigInt(0),
        alice.address,
        [alice.address],
        [10000000]
      )
    ).to.be.revertedWith("Initializable: contract is already initialized");
  });

  it("Should transfer ownership correctly", async () => {
    await opportunities.transferOwnership(alice.address);
    expect(await opportunities.owner()).to.be.equal(alice.address);
    await expect(
      opportunities.connect(bob).transferOwnership(bob.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should create manual distribution split", async () => {
    const OpportunitiesManualDistribution = await deployOpportunities(
      owner.address,
      [owner.address],
      true,
      false,
      ethers.utils.parseEther("1"),
      [alice.address, bob.address],
      [5000000, 5000000],
      ethers.constants.HashZero
    );

    const aliceBalanceBefore = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: OpportunitiesManualDistribution.address,
      value: ethers.utils.parseEther("50"),
    });

    const contractBalance = (
      await ethers.provider.getBalance(OpportunitiesManualDistribution.address)
    ).toBigInt();
    expect(contractBalance).to.be.equal(ethers.utils.parseEther("50"));

    await expect(
      OpportunitiesManualDistribution.connect(addr3).redistributeNativeCurrency(
        ethers.utils.parseEther("50"),
        0
      )
    ).to.be.revertedWithCustomError(opportunities, "OnlyDistributorError");

    await OpportunitiesManualDistribution.redistributeNativeCurrency(
      ethers.utils.parseEther("50"),
      0
    );

    const contractBalance2 = (
      await ethers.provider.getBalance(OpportunitiesManualDistribution.address)
    ).toBigInt();
    expect(contractBalance2).to.be.equal(0);

    const aliceBalanceAfter = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();
    expect(aliceBalanceAfter).to.be.equal(
      aliceBalanceBefore + ethers.utils.parseEther("25").toBigInt()
    );
  });

  it("Should work with fees correctly", async () => {
    const OpportunitiesFeeFactory = await ethers.getContractFactory(
      "OpportunitiesFactory"
    );
    const opportunitiesFeeFactory = await OpportunitiesFeeFactory.deploy();
    await opportunitiesFeeFactory.deployed();

    await expect(
      opportunitiesFeeFactory.connect(alice).setPlatformFee(BigInt(1))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      opportunitiesFeeFactory.setPlatformFee(BigInt(10000001))
    ).to.be.revertedWithCustomError(
      opportunitiesFeeFactory,
      "InvalidFeePercentage"
    );

    await expect(
      opportunitiesFeeFactory.connect(alice).setPlatformWallet(addr4.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await opportunitiesFeeFactory.setPlatformWallet(addr5.address);
    await opportunitiesFeeFactory.setPlatformFee(BigInt(5000000));

    expect(await opportunitiesFeeFactory.platformWallet()).to.be.equal(
      addr5.address
    );
    expect(await opportunitiesFeeFactory.platformFee()).to.be.equal(
      BigInt(5000000)
    );

    const txFee = await opportunitiesFeeFactory.createOpportunities({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [alice.address],
      percentages: [BigInt(10000000)],
      creationId: ethers.constants.HashZero,
    });
    const receipt = await txFee.wait();
    const revenueShareContractAddress = receipt.events?.[3].args?.[0];
    const RevenueShareContract = await ethers.getContractFactory(
      "Opportunities"
    );
    const opportunitiesFees = await RevenueShareContract.attach(
      revenueShareContractAddress
    );

    const platformWalletBalanceBefore = (
      await ethers.provider.getBalance(addr5.address)
    ).toBigInt();
    const aliceBalanceBefore = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: opportunitiesFees.address,
      value: ethers.utils.parseEther("50"),
    });
    await opportunitiesFees.redistributeNativeCurrency(
      ethers.utils.parseEther("50"),
      0
    );

    const platformWalletBalanceAfter = (
      await ethers.provider.getBalance(addr5.address)
    ).toBigInt();
    const aliceBalanceAfter = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();

    expect(platformWalletBalanceAfter).to.be.equal(
      platformWalletBalanceBefore + ethers.utils.parseEther("25").toBigInt()
    );
    expect(aliceBalanceAfter).to.be.equal(
      aliceBalanceBefore + ethers.utils.parseEther("25").toBigInt()
    );

    await testToken.mint(
      opportunitiesFees.address,
      ethers.utils.parseEther("100")
    );
    await opportunitiesFees.redistributeToken(
      testToken.address,
      ethers.utils.parseEther("100"),
      0
    );

    expect(await testToken.balanceOf(addr5.address)).to.be.equal(
      ethers.utils.parseEther("50")
    );
    expect(await testToken.balanceOf(alice.address)).to.be.equal(
      ethers.utils.parseEther("50")
    );
  });

  it("Should work with creation ID correctly", async () => {
    const OpportunitiesCreationIdFactory = await ethers.getContractFactory(
      "OpportunitiesFactory"
    );
    const opportunitiesCreationIdFactory =
      await OpportunitiesCreationIdFactory.deploy();
    await opportunitiesCreationIdFactory.deployed();

    await opportunitiesCreationIdFactory.createOpportunities({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [alice.address],
      percentages: [BigInt(10000000)],
      creationId: ethers.utils.formatBytes32String("test-creation-id-1"),
    });

    await expect(
      opportunitiesCreationIdFactory.createOpportunities({
        controller: owner.address,
        distributors: [owner.address],
        isImmutableRecipients: true,
        isAutoNativeCurrencyDistribution: true,
        minAutoDistributeAmount: ethers.utils.parseEther("1"),
        initialRecipients: [alice.address],
        percentages: [BigInt(10000000)],
        creationId: ethers.utils.formatBytes32String("test-creation-id-1"),
      })
    ).to.be.revertedWith("ERC1167: create2 failed");

    await opportunitiesCreationIdFactory.createOpportunities({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [alice.address, bob.address],
      percentages: [BigInt(5000000), BigInt(5000000)],
      creationId: ethers.utils.formatBytes32String("test-creation-id-1"),
    });

    await opportunitiesCreationIdFactory.createOpportunities({
      controller: owner.address,
      distributors: [owner.address],
      isImmutableRecipients: true,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: ethers.utils.parseEther("1"),
      initialRecipients: [alice.address],
      percentages: [BigInt(10000000)],
      creationId: ethers.utils.formatBytes32String("test-creation-id-2"),
    });
  });

  it("Should distribute small amounts correctly", async () => {
    await opportunities.setRecipients(
      [alice.address, bob.address],
      [2000000, 8000000],
      0
    );

    await testToken.mint(opportunities.address, BigInt(15000000));

    await opportunities.redistributeToken(
      testToken.address,
      BigInt(15000000),
      0
    );
    expect(await testToken.balanceOf(alice.address)).to.be.equal(
      BigInt(3000000)
    );
    expect(await testToken.balanceOf(bob.address)).to.be.equal(
      BigInt(12000000)
    );
    expect(await testToken.balanceOf(opportunities.address)).to.be.equal(
      BigInt(0)
    );

    await testToken.mint(opportunities.address, BigInt(15000000));

    await opportunities.redistributeToken(
      testToken.address,
      BigInt(15000000),
      0
    );
    expect(await testToken.balanceOf(alice.address)).to.be.equal(
      BigInt(6000000)
    );
    expect(await testToken.balanceOf(bob.address)).to.be.equal(
      BigInt(24000000)
    );
    expect(await testToken.balanceOf(opportunities.address)).to.be.equal(
      BigInt(0)
    );
  });

  it("Should distribute small ether amounts correctly", async () => {
    const opportunitiesXYZ = await deployOpportunities(
      owner.address,
      [owner.address],
      true,
      true,
      BigInt(10000000),
      [alice.address, bob.address],
      [5000000, 5000000],
      ethers.constants.HashZero
    );

    const aliceBalanceBefore1 = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();
    const bobBalanceBefore1 = (
      await ethers.provider.getBalance(bob.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: opportunitiesXYZ.address,
      value: ethers.utils.parseEther("0.000000000015"),
    });
    await opportunitiesXYZ.redistributeNativeCurrency(
      ethers.utils.parseEther("0.000000000015"),
      0
    );

    expect(
      (await ethers.provider.getBalance(alice.address)).toBigInt()
    ).to.be.equal(
      aliceBalanceBefore1 +
        ethers.utils.parseEther("0.0000000000075").toBigInt()
    );
    expect(
      (await ethers.provider.getBalance(bob.address)).toBigInt()
    ).to.be.equal(
      bobBalanceBefore1 + ethers.utils.parseEther("0.0000000000075").toBigInt()
    );
    expect(
      (await ethers.provider.getBalance(opportunitiesXYZ.address)).toBigInt()
    ).to.be.equal(BigInt(0));

    const aliceBalanceBefore2 = (
      await ethers.provider.getBalance(alice.address)
    ).toBigInt();
    const bobBalanceBefore2 = (
      await ethers.provider.getBalance(bob.address)
    ).toBigInt();

    await owner.sendTransaction({
      to: opportunitiesXYZ.address,
      value: ethers.utils.parseEther("0.000000000015"),
    });
    await opportunitiesXYZ.redistributeNativeCurrency(
      ethers.utils.parseEther("0.000000000015"),
      0
    );

    expect(
      (await ethers.provider.getBalance(opportunitiesXYZ.address)).toBigInt()
    ).to.be.equal(BigInt(0));
    expect(
      (await ethers.provider.getBalance(alice.address)).toBigInt()
    ).to.be.equal(
      aliceBalanceBefore2 +
        ethers.utils.parseEther("0.0000000000075").toBigInt()
    );

    expect(
      (await ethers.provider.getBalance(bob.address)).toBigInt()
    ).to.be.equal(
      bobBalanceBefore2 + ethers.utils.parseEther("0.0000000000075").toBigInt()
    );
  });
});
