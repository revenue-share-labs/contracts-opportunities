// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IFeeFactory.sol";

contract RSCValve is OwnableUpgradeable {
    mapping(address => bool) public distributors;
    address public controller;
    bool public immutableController;
    bool public autoNativeTokenDistribution;
    uint256 public minAutoDistributionAmount;
    uint256 public platformFee;
    IFeeFactory public factory;

    mapping(uint256 => address[]) public recipients;
    mapping(uint256 => mapping(address => uint256)) public recipientsPercentage;

    event SetRecipients(address payable[] recipients, uint256[] percentages);
    event DistributeToken(address token, uint256 amount);
    event DistributorChanged(address distributor, bool isDistributor);
    event ControllerChanged(address oldController, address newController);

    // Throw when if sender is not distributor
    error OnlyDistributorError();

    // Throw when sender is not controller
    error OnlyControllerError();

    // Throw when transaction fails
    error TransferFailedError();

    // Throw when submitted recipient with address(0)
    error NullAddressRecipientError();

    // Throw if recipient is already in contract
    error RecipientAlreadyAddedError();

    // Throw when arrays are submit without same length
    error InconsistentDataLengthError();

    // Throw when sum of percentage is not 100%
    error InvalidPercentageError();

    // Throw when RSC doesnt have any ERC20 balance for given token
    error Erc20ZeroBalanceError();

    // Throw when distributor address is same as submit one
    error DistributorAlreadyConfiguredError();

    // Throw when distributor address is same as submit one
    error ControllerAlreadyConfiguredError();

    // Throw when change is triggered for immutable controller
    error ImmutableControllerError();

    //
    error AmountMoreThanBalance();

    /**
     * @dev Checks whether sender is distributor
     */
    modifier onlyDistributor() {
        if (distributors[msg.sender] == false) {
            revert OnlyDistributorError();
        }
        _;
    }

    /**
     * @dev Checks whether sender is controller
     */
    modifier onlyController() {
        if (msg.sender != controller) {
            revert OnlyControllerError();
        }
        _;
    }

    /**
     * @dev Constructor function, can be called only once
     * @param _owner Owner of the contract
     * @param _controller address which control setting / removing recipients
     * @param _distributors list of addresses which can distribute ERC20 tokens or native token
     * @param _immutableController flag indicating whether controller could be changed
     * @param _autoNativeTokenDistribution flag indicating whether native token will be automatically distributed or manually
     * @param _minAutoDistributionAmount Minimum native token amount to trigger auto native token distribution
     * @param _platformFee Percentage defining fee for distribution services
     * @param _factoryAddress Address of the factory used for creating this RSC
     * @param _initialRecipients Initial recipient addresses
     * @param _percentages initial percentages for recipients
     */
    function initialize(
        address _owner,
        address _controller,
        address[] memory _distributors,
        bool _immutableController,
        bool _autoNativeTokenDistribution,
        uint256 _minAutoDistributionAmount,
        uint256 _platformFee,
        address _factoryAddress,
        address payable[] memory _initialRecipients,
        uint256[] memory _percentages
    ) public initializer {
        uint256 distributorsLength = _distributors.length;
        for (uint256 i = 0; i < distributorsLength; ) {
            distributors[_distributors[i]] = true;
            unchecked {
                i++;
            }
        }

        controller = _controller;
        immutableController = _immutableController;
        autoNativeTokenDistribution = _autoNativeTokenDistribution;
        minAutoDistributionAmount = _minAutoDistributionAmount;
        factory = IFeeFactory(_factoryAddress);
        platformFee = _platformFee;

        _setRecipients(_initialRecipients, _percentages, 0);
        _transferOwnership(_owner);
    }

    fallback() external payable {
        // Check whether automatic native token distribution is enabled
        // and that contractBalance is more than automatic distribution trash hold

        (uint256 index, uint256 amount) = abi.decode(
            msg.data,
            (uint256, uint256)
        );

        uint256 contractBalance = address(this).balance;
        if (amount >= contractBalance) {
            revert AmountMoreThanBalance();
        }
        if (
            autoNativeTokenDistribution &&
            contractBalance >= minAutoDistributionAmount
        ) {
            _redistributeNativeToken(amount, index);
        }
    }

    receive() external payable {}

    /**
     * @notice External function to return number of recipients
     */
    function numberOfRecipients(uint256 index) external view returns (uint256) {
        return recipients[index].length;
    }

    /**
     * @notice Internal function to redistribute native token based on percentages assign to the recipients
     * @param _valueToDistribute native token amount to be distributed
     */
    function _redistributeNativeToken(
        uint256 _valueToDistribute,
        uint256 index
    ) internal {
        if (platformFee > 0) {
            uint256 fee = (_valueToDistribute / 10000000) * platformFee;
            _valueToDistribute -= fee;
            address payable platformWallet = factory.platformWallet();
            (bool success, ) = platformWallet.call{ value: fee }("");
            if (success == false) {
                revert TransferFailedError();
            }
        }

        uint256 recipientsLength = recipients[index].length;
        for (uint256 i = 0; i < recipientsLength; ) {
            address payable recipient = payable(recipients[index][i]);
            uint256 percentage = recipientsPercentage[index][recipient];
            uint256 amountToReceive = (_valueToDistribute / 10000000) *
                percentage;
            (bool success, ) = payable(recipient).call{
                value: amountToReceive
            }("");
            if (success == false) {
                revert TransferFailedError();
            }
            unchecked {
                i++;
            }
        }
    }

    /**
     * @notice External function to redistribute native token based on percentages assign to the recipients
     */
    function redistributeNativeToken(
        uint256 amount,
        uint256 index
    ) external onlyDistributor {
        if (amount > address(this).balance) {
            revert AmountMoreThanBalance();
        }
        _redistributeNativeToken(amount, index);
    }

    /**
     * @notice Internal function to check whether percentages are equal to 100%
     * @return valid boolean indicating whether sum of percentage == 100% (10000000)
     */
    function _percentageIsValid(
        uint256 index
    ) internal view returns (bool valid) {
        uint256 recipientsLength = recipients[index].length;
        uint256 percentageSum;

        for (uint256 i = 0; i < recipientsLength; ) {
            address recipient = recipients[index][i];
            percentageSum += recipientsPercentage[index][recipient];
            unchecked {
                i++;
            }
        }

        return percentageSum == 10000000;
    }

    /**
     * @notice Internal function for adding recipient to revenue share
     * @param _recipient Fixed amount of token user want to buy
     * @param _percentage code of the affiliation partner
     */
    function _addRecipient(
        address payable _recipient,
        uint256 _percentage,
        uint256 index
    ) internal {
        if (_recipient == address(0)) {
            revert NullAddressRecipientError();
        }
        recipients[index].push(_recipient);
        recipientsPercentage[index][_recipient] = _percentage;
    }

    /**
     * @notice Internal function for removing all recipients
     */
    function _removeAll(uint256 index) internal {
        uint256 recipientsLength = recipients[index].length;

        if (recipientsLength == 0) {
            return;
        }

        for (uint256 i = 0; i < recipientsLength; ) {
            address recipient = recipients[index][i];
            recipientsPercentage[index][recipient] = 0;
            unchecked {
                i++;
            }
        }
        delete recipients[index];
    }

    /**
     * @notice Internal function for setting recipients
     * @param _newRecipients Addresses to be added
     * @param _percentages new percentages for recipients
     */
    function _setRecipients(
        address payable[] memory _newRecipients,
        uint256[] memory _percentages,
        uint256 index
    ) internal {
        uint256 newRecipientsLength = _newRecipients.length;

        if (newRecipientsLength != _percentages.length) {
            revert InconsistentDataLengthError();
        }

        _removeAll(index);

        for (uint256 i = 0; i < newRecipientsLength; ) {
            _addRecipient(_newRecipients[i], _percentages[i], index);
            unchecked {
                i++;
            }
        }

        if (_percentageIsValid(index) == false) {
            revert InvalidPercentageError();
        }

        emit SetRecipients(_newRecipients, _percentages);
    }

    /**
     * @notice External function for setting recipients
     * @param _newRecipients Addresses to be added
     * @param _percentages new percentages for recipients
     */
    function setRecipients(
        address payable[] memory _newRecipients,
        uint256[] memory _percentages,
        uint256 index
    ) public onlyController {
        _setRecipients(_newRecipients, _percentages, index);
    }

    /**
     * @notice External function to redistribute ERC20 token based on percentages assign to the recipients
     * @param _token Address of the ERC20 token to be distribute
     */
    function redistributeToken(
        address _token,
        uint256 amount,
        uint256 index
    ) external onlyDistributor {
        uint256 recipientsLength = recipients[index].length;

        IERC20 erc20Token = IERC20(_token);
        uint256 contractBalance = erc20Token.balanceOf(address(this));
        if (contractBalance < amount) {
            revert Erc20ZeroBalanceError();
        }

        if (platformFee > 0) {
            uint256 fee = (amount / 10000000) * platformFee;
            amount -= fee;
            address payable platformWallet = factory.platformWallet();
            erc20Token.transfer(platformWallet, fee);
        }

        for (uint256 i = 0; i < recipientsLength; ) {
            address payable recipient = payable(recipients[index][i]);
            uint256 percentage = recipientsPercentage[index][recipient];
            uint256 amountToReceive = (amount / 10000000) * percentage;
            erc20Token.transfer(recipient, amountToReceive);
            unchecked {
                i++;
            }
        }
        emit DistributeToken(_token, amount);
    }

    /**
     * @notice External function to set distributor address
     * @param _distributor address of new distributor
     * @param _isDistributor bool indicating whether address is / isn't distributor
     */
    function setDistributor(
        address _distributor,
        bool _isDistributor
    ) external onlyOwner {
        emit DistributorChanged(_distributor, _isDistributor);
        distributors[_distributor] = _isDistributor;
    }

    /**
     * @notice External function to set controller address, if set to address(0), unable to change it
     * @param _controller address of new controller
     */
    function setController(address _controller) external onlyOwner {
        if (controller == address(0) || immutableController) {
            revert ImmutableControllerError();
        }
        emit ControllerChanged(controller, _controller);
        controller = _controller;
    }
}
