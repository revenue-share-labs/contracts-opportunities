# OpportunitiesFactory

## Contract Description


License: MIT

## Events info

### OpportunitiesCreated event

```solidity
event OpportunitiesCreated(
	address contractAddress,
	address controller,
	address[] distributors,
	bytes32 version,
	bool isImmutableRecipients,
	bool isAutoNativeCurrencyDistribution,
	uint256 minAutoDistributeAmount,
	bytes32 creationId
);
```

### OwnershipTransferred event

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### PlatformFeeChanged event

```solidity
event PlatformFeeChanged(uint256 oldFee, uint256 newFee);
```

### PlatformWalletChanged event

```solidity
event PlatformWalletChanged(address oldPlatformWallet, address newPlatformWallet);
```

## Errors info

### InvalidFeePercentage error

```solidity
error InvalidFeePercentage();
```

## Functions info

### contractImplementation (0x9e72370b)

```solidity
function contractImplementation() external view returns (address);
```

### createOpportunities (0xc67dc9ba)

```solidity
function createOpportunities(tuple _data) external returns (address);
```


Public function for creating clone proxy pointing to Opportunities Percentage


Parameters:

| Name  | Type  | Description                                          |
| :---- | :---- | :--------------------------------------------------- |
| _data | tuple | Initial data for creating new Opportunities contract |

### owner (0x8da5cb5b)

```solidity
function owner() external view returns (address);
```


Returns the address of the current owner.

### platformFee (0x26232a2e)

```solidity
function platformFee() external view returns (uint256);
```

### platformWallet (0xfa2af9da)

```solidity
function platformWallet() external view returns (address);
```

### predictDeterministicAddress (0xa0c7b014)

```solidity
function predictDeterministicAddress(
	tuple _data,
	address _deployer
) external view returns (address);
```


External function for creating clone proxy pointing to Opportunities Percentage


Parameters:

| Name      | Type    | Description                                                        |
| :-------- | :------ | :----------------------------------------------------------------- |
| _data     | tuple   | Opportunities Create data used for hashing and getting random salt |
| _deployer | address | Wallet address that want to create new Opportunities contract      |

### renounceOwnership (0x715018a6)

```solidity
function renounceOwnership() external;
```


Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.

### setPlatformFee (0x12e8e2c3)

```solidity
function setPlatformFee(uint256 _fee) external;
```


Owner function for setting platform fee


Parameters:

| Name | Type    | Description                                     |
| :--- | :------ | :---------------------------------------------- |
| _fee | uint256 | Percentage define platform fee 100% == 10000000 |

### setPlatformWallet (0x8831e9cf)

```solidity
function setPlatformWallet(address _platformWallet) external;
```


Owner function for setting platform fee


Parameters:

| Name            | Type    | Description                                       |
| :-------------- | :------ | :------------------------------------------------ |
| _platformWallet | address | New native currency wallet which will receive fee |

### transferOwnership (0xf2fde38b)

```solidity
function transferOwnership(address newOwner) external;
```


Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.

### version (0x54fd4d50)

```solidity
function version() external view returns (bytes32);
```
