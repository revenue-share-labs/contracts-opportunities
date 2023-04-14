# Opportunities

## Contract Description


License: MIT

## Events info

### AutoNativeCurrencyDistributionChanged event

```solidity
event AutoNativeCurrencyDistributionChanged(bool oldValue, bool newValue);
```

### ControllerChanged event

```solidity
event ControllerChanged(address oldController, address newController);
```

### DistributeNativeCurrency event

```solidity
event DistributeNativeCurrency(uint256 amount, uint256 index);
```

### DistributeToken event

```solidity
event DistributeToken(address token, uint256 amount, uint256 index);
```

### DistributorChanged event

```solidity
event DistributorChanged(address distributor, bool isDistributor);
```

### ImmutableRecipients event

```solidity
event ImmutableRecipients(bool isImmutableRecipients);
```

### Initialized event

```solidity
event Initialized(uint8 version);
```


Triggered when the contract has been initialized or reinitialized.

### MinAutoDistributionAmountChanged event

```solidity
event MinAutoDistributionAmountChanged(uint256 oldAmount, uint256 newAmount);
```

### OwnershipTransferred event

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### SetRecipients event

```solidity
event SetRecipients(address[] recipients, uint256[] percentages);
```

## Errors info

### AmountMoreThanBalance error

```solidity
error AmountMoreThanBalance();
```

### ImmutableRecipientsError error

```solidity
error ImmutableRecipientsError();
```

### InconsistentDataLengthError error

```solidity
error InconsistentDataLengthError();
```

### InvalidPercentageError error

```solidity
error InvalidPercentageError();
```

### NullAddressRecipientError error

```solidity
error NullAddressRecipientError();
```

### OnlyControllerError error

```solidity
error OnlyControllerError();
```

### OnlyDistributorError error

```solidity
error OnlyDistributorError();
```

### RenounceOwnershipForbidden error

```solidity
error RenounceOwnershipForbidden();
```

### TransferFailedError error

```solidity
error TransferFailedError();
```

## Functions info

### controller (0xf77c4791)

```solidity
function controller() external view returns (address);
```

### distributors (0xcc642784)

```solidity
function distributors(address) external view returns (bool);
```

### factory (0xc45a0155)

```solidity
function factory() external view returns (address);
```

### initialize (0xe6bfdc0b)

```solidity
function initialize(
	address _owner,
	address _controller,
	address[] _distributors,
	bool _isImmutableRecipients,
	bool _isAutoNativeCurrencyDistribution,
	uint256 _minAutoDistributionAmount,
	uint256 _platformFee,
	address _factoryAddress,
	address[] _initialRecipients,
	uint256[] _percentages
) external;
```


Constructor function, can be called only once


Parameters:

| Name                              | Type      | Description                                                                           |
| :-------------------------------- | :-------- | :------------------------------------------------------------------------------------ |
| _owner                            | address   | Owner of the contract                                                                 |
| _controller                       | address   | Address which control setting / removing recipients                                   |
| _distributors                     | address[] | List of addresses which can distribute ERC20 tokens or native currency                |
| _isImmutableRecipients            | bool      | Flag indicating whether recipients could be changed                                   |
| _isAutoNativeCurrencyDistribution | bool      | Flag indicating whether native currency will be automatically distributed or manually |
| _minAutoDistributionAmount        | uint256   | Minimum native currency amount to trigger auto native currency distribution           |
| _platformFee                      | uint256   | Percentage defining fee for distribution services                                     |
| _factoryAddress                   | address   | Address of the factory used for creating this Opportunities contract                  |
| _initialRecipients                | address[] | Initial recipient addresses                                                           |
| _percentages                      | uint256[] | Initial percentages for recipients                                                    |

### isAutoNativeCurrencyDistribution (0x0808e1c6)

```solidity
function isAutoNativeCurrencyDistribution() external view returns (bool);
```

### isImmutableRecipients (0xeaf4598a)

```solidity
function isImmutableRecipients() external view returns (bool);
```

### minAutoDistributionAmount (0x478f425a)

```solidity
function minAutoDistributionAmount() external view returns (uint256);
```

### numberOfRecipients (0x2d164c03)

```solidity
function numberOfRecipients(uint256 _index) external view returns (uint256);
```


External function to return number of recipients


Parameters:

| Name   | Type    | Description       |
| :----- | :------ | :---------------- |
| _index | uint256 | Transaction index |

### owner (0x8da5cb5b)

```solidity
function owner() external view returns (address);
```


Returns the address of the current owner.

### platformFee (0x26232a2e)

```solidity
function platformFee() external view returns (uint256);
```

### recipients (0xb56626d2)

```solidity
function recipients(uint256, uint256) external view returns (address);
```

### recipientsPercentage (0xefe67213)

```solidity
function recipientsPercentage(uint256, address) external view returns (uint256);
```

### redistributeNativeCurrency (0xfc1760ad)

```solidity
function redistributeNativeCurrency(uint256 _amount, uint256 _index) external;
```


External function to redistribute native tokens


Parameters:

| Name    | Type    | Description            |
| :------ | :------ | :--------------------- |
| _amount | uint256 | Amount to redistribute |
| _index  | uint256 | Transaction index      |

### redistributeToken (0x708172f4)

```solidity
function redistributeToken(address _token, uint256 _amount, uint256 _index) external;
```


External function to redistribute ERC20 tokens


Parameters:

| Name   | Type    | Description                                 |
| :----- | :------ | :------------------------------------------ |
| _token | address | Address of the ERC20 token to be distribute |
| _index | uint256 | Transaction index                           |

### renounceOwnership (0x715018a6)

```solidity
function renounceOwnership() external view;
```


Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will is forbidden for Opportunities contract

### setAutoNativeCurrencyDistribution (0x3d39e377)

```solidity
function setAutoNativeCurrencyDistribution(bool _isAutoNativeCurrencyDistribution) external;
```


External function for setting auto native currency distribution


Parameters:

| Name                              | Type | Description                                                         |
| :-------------------------------- | :--- | :------------------------------------------------------------------ |
| _isAutoNativeCurrencyDistribution | bool | Bool switching whether auto native currency distribution is enabled |

### setController (0x92eefe9b)

```solidity
function setController(address _controller) external;
```


External function to set controller address


Parameters:

| Name        | Type    | Description               |
| :---------- | :------ | :------------------------ |
| _controller | address | Address of new controller |

### setDistributor (0xd59ba0df)

```solidity
function setDistributor(address _distributor, bool _isDistributor) external;
```


External function to set distributor address


Parameters:

| Name           | Type    | Description                                            |
| :------------- | :------ | :----------------------------------------------------- |
| _distributor   | address | Address of new distributor                             |
| _isDistributor | bool    | Bool indicating whether address is / isn't distributor |

### setImmutableRecipients (0x50a2f6c8)

```solidity
function setImmutableRecipients() external;
```


External function for setting immutable recipients to true

### setMinAutoDistributionAmount (0xf432c79f)

```solidity
function setMinAutoDistributionAmount(uint256 _minAutoDistributionAmount) external;
```


External function for setting minimun auto distribution amount


Parameters:

| Name                       | Type    | Description                     |
| :------------------------- | :------ | :------------------------------ |
| _minAutoDistributionAmount | uint256 | New minimum distribution amount |

### setRecipients (0x683f3277)

```solidity
function setRecipients(address[] _newRecipients, uint256[] _percentages, uint256 _index) external;
```


External function for setting recipients


Parameters:

| Name           | Type      | Description                    |
| :------------- | :-------- | :----------------------------- |
| _newRecipients | address[] | Addresses to be added          |
| _percentages   | uint256[] | New percentages for recipients |
| _index         | uint256   | Transaction index              |

### setRecipientsExt (0x6443e4b9)

```solidity
function setRecipientsExt(
	address[] _newRecipients,
	uint256[] _percentages,
	uint256 _index
) external;
```


External function for setting recipients and make recipients immutable


Parameters:

| Name           | Type      | Description                    |
| :------------- | :-------- | :----------------------------- |
| _newRecipients | address[] | Addresses to be added          |
| _percentages   | uint256[] | New percentages for recipients |
| _index         | uint256   | Transaction index              |

### transferOwnership (0xf2fde38b)

```solidity
function transferOwnership(address newOwner) external;
```


Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.
