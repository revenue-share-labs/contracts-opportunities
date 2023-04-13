// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IFeeFactory.sol";

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

// Throw when distributor address is same as submit one
error DistributorAlreadyConfiguredError();

// Throw when distributor address is same as submit one
error ControllerAlreadyConfiguredError();

// Throw when change is triggered for immutable recipients
error ImmutableRecipientsError();

// Throw when renounce ownership is called
error RenounceOwnershipForbidden();

// Throw when amount to distribute is more than contract balance
error AmountMoreThanBalance();

contract RSCValve is OwnableUpgradeable {
    using SafeERC20 for IERC20;

    mapping(address => bool) public distributors;
    address public controller;
    bool public isImmutableRecipients;
    bool public isAutoNativeCurrencyDistribution;
    uint256 public minAutoDistributionAmount;
    uint256 public platformFee;
    IFeeFactory public factory;

    mapping(uint256 => address payable[]) public recipients;
    mapping(uint256 => mapping(address => uint256)) public recipientsPercentage;

    event SetRecipients(address payable[] recipients, uint256[] percentages);
    event DistributeToken(address token, uint256 amount, uint256 index);
    event DistributeNativeCurrency(uint256 amount, uint256 index);
    event DistributorChanged(address distributor, bool isDistributor);
    event ControllerChanged(address oldController, address newController);
    event MinAutoDistributionAmountChanged(
        uint256 oldAmount,
        uint256 newAmount
    );
    event AutoNativeCurrencyDistributionChanged(bool oldValue, bool newValue);
    event ImmutableRecipients(bool isImmutableRecipients);

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
     * @param _distributors list of addresses which can distribute ERC20 tokens or native currency
     * @param _isImmutableRecipients flag indicating whether recipients could be changed
     * @param _isAutoNativeCurrencyDistribution flag indicating whether native currency will be automatically distributed or manually
     * @param _minAutoDistributionAmount Minimum native currency amount to trigger auto native currency distribution
     * @param _platformFee Percentage defining fee for distribution services
     * @param _factoryAddress Address of the factory used for creating this RSC
     * @param _initialRecipients Initial recipient addresses
     * @param _percentages initial percentages for recipients
     */
    function initialize(
        address _owner,
        address _controller,
        address[] memory _distributors,
        bool _isImmutableRecipients,
        bool _isAutoNativeCurrencyDistribution,
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
        isAutoNativeCurrencyDistribution = _isAutoNativeCurrencyDistribution;
        minAutoDistributionAmount = _minAutoDistributionAmount;
        factory = IFeeFactory(_factoryAddress);
        platformFee = _platformFee;

        _setRecipients(_initialRecipients, _percentages, 0);
        isImmutableRecipients = _isImmutableRecipients;
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
            isAutoNativeCurrencyDistribution &&
            contractBalance >= minAutoDistributionAmount
        ) {
            _redistributeNativeCurrency(amount, index);
        }
    }

    receive() external payable {}

    /**
     * @notice External function to return number of recipients
     */
    function numberOfRecipients(
        uint256 _index
    ) external view returns (uint256) {
        return recipients[_index].length;
    }

    /**
     * @notice Internal function to redistribute native token based on percentages assign to the recipients
     * @param _valueToDistribute native token amount to be distributed
     */
    function _redistributeNativeCurrency(
        uint256 _valueToDistribute,
        uint256 _index
    ) internal {
        uint256 fee = ((_valueToDistribute * platformFee) / 10000000);
        _valueToDistribute -= fee;

        if (_valueToDistribute < 10000000) {
            return;
        }

        address payable platformWallet = factory.platformWallet();
        if (fee != 0 && platformWallet != address(0)) {
            (bool success, ) = platformWallet.call{ value: fee }("");
            if (success == false) {
                revert TransferFailedError();
            }
        }

        uint256 recipientsLength = recipients[_index].length;
        for (uint256 i = 0; i < recipientsLength; ) {
            address payable recipient = payable(recipients[_index][i]);
            uint256 percentage = recipientsPercentage[_index][recipient];
            uint256 amountToReceive = _valueToDistribute * percentage / 10000000;
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
        emit DistributeNativeCurrency(_valueToDistribute, _index);
    }

    /**
     * @notice External function to redistribute native token based on percentages assign to the recipients
     */
    function redistributeNativeCurrency(
        uint256 amount,
        uint256 index
    ) external onlyDistributor {
        if (amount > address(this).balance) {
            revert AmountMoreThanBalance();
        }
        _redistributeNativeCurrency(amount, index);
    }

    /**
     * @notice Internal function for adding recipient to revenue share
     * @param _recipient Fixed amount of token user want to buy
     * @param _percentage code of the affiliation partner
     */
    function _addRecipient(
        address payable _recipient,
        uint256 _percentage,
        uint256 _index
    ) internal {
        if (_recipient == address(0)) {
            revert NullAddressRecipientError();
        }
        recipients[_index].push(_recipient);
        recipientsPercentage[_index][_recipient] = _percentage;
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
        uint256 _index
    ) internal {
        if (isImmutableRecipients) {
            revert ImmutableRecipientsError();
        }

        uint256 newRecipientsLength = _newRecipients.length;

        if (newRecipientsLength != _percentages.length) {
            revert InconsistentDataLengthError();
        }

        _removeAll(_index);

        uint256 percentageSum;
        for (uint256 i = 0; i < newRecipientsLength; ) {
            uint256 percentage = _percentages[i];
            _addRecipient(_newRecipients[i], _percentages[i], _index);
            percentageSum += percentage;
            unchecked {
                i++;
            }
        }

        if (percentageSum != 10000000) {
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
        uint256 _index
    ) public onlyController {
        _setRecipients(_newRecipients, _percentages, _index);
    }

    /**
     * @notice External function for setting recipients and make recipients immutable
     * @param _newRecipients Addresses to be added
     * @param _percentages new percentages for recipients
     */
    function setRecipientsExt(
        address payable[] memory _newRecipients,
        uint256[] memory _percentages,
        uint256 _index
    ) public onlyController {
        _setRecipients(_newRecipients, _percentages, _index);
        _setImmutableRecipients();
    }

    /**
     * @notice External function to redistribute ERC20 token based on percentages assign to the recipients
     * @param _token Address of the ERC20 token to be distribute
     */
    function redistributeToken(
        address _token,
        uint256 _amount,
        uint256 _index
    ) external onlyDistributor {
        IERC20 erc20Token = IERC20(_token);
        uint256 contractBalance = erc20Token.balanceOf(address(this));
        if (contractBalance < 10000000) {
            // because of percentage
            return;
        }

        address payable platformWallet = factory.platformWallet();
        uint256 fee = _amount * platformFee / 10000000;
        _amount -= fee;
        if (fee != 0 && platformWallet != address(0)) {
            erc20Token.safeTransfer(platformWallet, fee);
        }

        uint256 recipientsLength = recipients[_index].length;
        for (uint256 i = 0; i < recipientsLength; ) {
            address payable recipient = recipients[_index][i];
            uint256 percentage = recipientsPercentage[_index][recipient];
            uint256 amountToReceive = _amount * percentage / 10000000;
            erc20Token.safeTransfer(recipient, amountToReceive);
            unchecked {
                i++;
            }
        }
        emit DistributeToken(_token, _amount, _index);
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
     * @notice External function to set controller address
     * @param _controller address of new controller
     */
    function setController(address _controller) external onlyOwner {
        emit ControllerChanged(controller, _controller);
        controller = _controller;
    }

    /**
     * @notice Internal function for setting immutable recipients to true
     */
    function _setImmutableRecipients() internal {
        emit ImmutableRecipients(true);
        isImmutableRecipients = true;
    }

    /**
     * @notice external function for setting immutable recipients to true
     */
    function setImmutableRecipients() external onlyOwner {
        if (isImmutableRecipients) {
            revert ImmutableRecipientsError();
        }

        _setImmutableRecipients();
    }

    /**
     * @notice external function for setting auto native currency distribution
     * @param _isAutoNativeCurrencyDistribution Bool switching whether auto native currency distribution is enabled
     */
    function setAutoNativeCurrencyDistribution(
        bool _isAutoNativeCurrencyDistribution
    ) external onlyOwner {
        emit AutoNativeCurrencyDistributionChanged(
            isAutoNativeCurrencyDistribution,
            _isAutoNativeCurrencyDistribution
        );
        isAutoNativeCurrencyDistribution = _isAutoNativeCurrencyDistribution;
    }

    /**
     * @notice external function for setting auto native currency distribution
     * @param _minAutoDistributionAmount New minimum distribution amount
     */
    function setMinAutoDistributionAmount(
        uint256 _minAutoDistributionAmount
    ) external onlyOwner {
        emit MinAutoDistributionAmountChanged(
            minAutoDistributionAmount,
            _minAutoDistributionAmount
        );
        minAutoDistributionAmount = _minAutoDistributionAmount;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will is forbidden for RSC contract
     */
    function renounceOwnership() public view override onlyOwner {
        revert RenounceOwnershipForbidden();
    }
}
