// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RSCValve.sol";

contract RSCValveFactory is Ownable {
    address public immutable contractImplementation;
    uint256 constant version = 1;
    uint256 public platformFee;
    address payable public platformWallet;

    // creationId unique ID for each contract creation TX, it prevents users to submit tx twice
    mapping(bytes32 => bool) public processedCreationIds;

    struct RSCCreateData {
        address controller;
        address[] distributors;
        bool immutableController;
        bool autoNativeTokenDistribution;
        uint256 minAutoDistributeAmount;
        address payable[] initialRecipients;
        uint256[] percentages;
        bytes32 creationId;
    }

    event RSCValveCreated(
        address contractAddress,
        address controller,
        address[] distributor,
        uint256 version,
        bool immutableController,
        bool autoNativeTokenDistribution,
        uint256 minAutoDistributeAmount,
        bytes32 creationId
    );

    event PlatformFeeChanged(uint256 oldFee, uint256 newFee);

    event PlatformWalletChanged(
        address payable oldPlatformWallet,
        address payable newPlatformWallet
    );

    // Throw when Fee Percentage is more than 100%
    error InvalidFeePercentage();

    // Throw when creationId was already created
    error CreationIdAlreadyProcessed();

    constructor() {
        contractImplementation = address(new RSCValve());
    }

    /**
     * @dev Public function for creating clone proxy pointing to RSC Percentage
     * @param _data Initial data for creating new RSC Valve contract
     */
    function createRSCValve(
        RSCCreateData memory _data
    ) external returns (address) {
        // check and register creationId
        bytes32 creationId = _data.creationId;
        if (creationId != bytes32(0)) {
            bool processed = processedCreationIds[creationId];
            if (processed) {
                revert CreationIdAlreadyProcessed();
            } else {
                processedCreationIds[creationId] = true;
            }
        }

        address payable clone = payable(Clones.clone(contractImplementation));

        RSCValve(clone).initialize(
            msg.sender,
            _data.controller,
            _data.distributors,
            _data.immutableController,
            _data.autoNativeTokenDistribution,
            _data.minAutoDistributeAmount,
            platformFee,
            address(this),
            _data.initialRecipients,
            _data.percentages
        );

        emit RSCValveCreated(
            clone,
            _data.controller,
            _data.distributors,
            version,
            _data.immutableController,
            _data.autoNativeTokenDistribution,
            _data.minAutoDistributeAmount,
            creationId
        );

        return clone;
    }

    /**
     * @dev Only Owner function for setting platform fee
     * @param _fee Percentage define platform fee 100% == 10000000
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        if (_fee > 10000000) {
            revert InvalidFeePercentage();
        }
        emit PlatformFeeChanged(platformFee, _fee);
        platformFee = _fee;
    }

    /**
     * @dev Only Owner function for setting platform fee
     * @param _platformWallet New native token wallet which will receive fee
     */
    function setPlatformWallet(
        address payable _platformWallet
    ) external onlyOwner {
        emit PlatformWalletChanged(platformWallet, _platformWallet);
        platformWallet = _platformWallet;
    }
}
