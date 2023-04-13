# IERC20Metadata

## Contract Description


License: MIT


Interface for the optional metadata functions from the ERC20 standard. _Available since v4.1._

## Events info

### Approval event

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value);
```


Emitted when the allowance of a `spender` for an `owner` is set by a call to {approve}. `value` is the new allowance.

### Transfer event

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```


Emitted when `value` tokens are moved from one account (`from`) to another (`to`). Note that `value` may be zero.

## Functions info

### allowance (0xdd62ed3e)

```solidity
function allowance(address owner, address spender) external view returns (uint256);
```


Returns the remaining number of tokens that `spender` will be allowed to spend on behalf of `owner` through {transferFrom}. This is zero by default. This value changes when {approve} or {transferFrom} are called.

### approve (0x095ea7b3)

```solidity
function approve(address spender, uint256 amount) external returns (bool);
```


Sets `amount` as the allowance of `spender` over the caller's tokens. Returns a boolean value indicating whether the operation succeeded. IMPORTANT: Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729 Emits an {Approval} event.

### balanceOf (0x70a08231)

```solidity
function balanceOf(address account) external view returns (uint256);
```


Returns the amount of tokens owned by `account`.

### decimals (0x313ce567)

```solidity
function decimals() external view returns (uint8);
```


Returns the decimals places of the token.

### name (0x06fdde03)

```solidity
function name() external view returns (string);
```


Returns the name of the token.

### symbol (0x95d89b41)

```solidity
function symbol() external view returns (string);
```


Returns the symbol of the token.

### totalSupply (0x18160ddd)

```solidity
function totalSupply() external view returns (uint256);
```


Returns the amount of tokens in existence.

### transfer (0xa9059cbb)

```solidity
function transfer(address to, uint256 amount) external returns (bool);
```


Moves `amount` tokens from the caller's account to `to`. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.

### transferFrom (0x23b872dd)

```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool);
```


Moves `amount` tokens from `from` to `to` using the allowance mechanism. `amount` is then deducted from the caller's allowance. Returns a boolean value indicating whether the operation succeeded. Emits a {Transfer} event.
