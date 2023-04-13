# ERC20

## Contract Description


License: MIT


Implementation of the {IERC20} interface. This implementation is agnostic to the way tokens are created. This means that a supply mechanism has to be added in a derived contract using {_mint}. For a generic mechanism see {ERC20PresetMinterPauser}. TIP: For a detailed writeup see our guide https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How to implement supply mechanisms]. We have followed general OpenZeppelin Contracts guidelines: functions revert instead returning `false` on failure. This behavior is nonetheless conventional and does not conflict with the expectations of ERC20 applications. Additionally, an {Approval} event is emitted on calls to {transferFrom}. This allows applications to reconstruct the allowance for all accounts just by listening to said events. Other implementations of the EIP may not emit these events, as it isn't required by the specification. Finally, the non-standard {decreaseAllowance} and {increaseAllowance} functions have been added to mitigate the well-known issues around setting allowances. See {IERC20-approve}.

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


See {IERC20-allowance}.

### approve (0x095ea7b3)

```solidity
function approve(address spender, uint256 amount) external returns (bool);
```


See {IERC20-approve}. NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on `transferFrom`. This is semantically equivalent to an infinite approval. Requirements: - `spender` cannot be the zero address.

### balanceOf (0x70a08231)

```solidity
function balanceOf(address account) external view returns (uint256);
```


See {IERC20-balanceOf}.

### decimals (0x313ce567)

```solidity
function decimals() external view returns (uint8);
```


Returns the number of decimals used to get its user representation. For example, if `decimals` equals `2`, a balance of `505` tokens should be displayed to a user as `5.05` (`505 / 10 ** 2`). Tokens usually opt for a value of 18, imitating the relationship between Ether and Wei. This is the value {ERC20} uses, unless this function is overridden; NOTE: This information is only used for _display_ purposes: it in no way affects any of the arithmetic of the contract, including {IERC20-balanceOf} and {IERC20-transfer}.

### decreaseAllowance (0xa457c2d7)

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);
```


Atomically decreases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address. - `spender` must have allowance for the caller of at least `subtractedValue`.

### increaseAllowance (0x39509351)

```solidity
function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
```


Atomically increases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address.

### name (0x06fdde03)

```solidity
function name() external view returns (string);
```


Returns the name of the token.

### symbol (0x95d89b41)

```solidity
function symbol() external view returns (string);
```


Returns the symbol of the token, usually a shorter version of the name.

### totalSupply (0x18160ddd)

```solidity
function totalSupply() external view returns (uint256);
```


See {IERC20-totalSupply}.

### transfer (0xa9059cbb)

```solidity
function transfer(address to, uint256 amount) external returns (bool);
```


See {IERC20-transfer}. Requirements: - `to` cannot be the zero address. - the caller must have a balance of at least `amount`.

### transferFrom (0x23b872dd)

```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool);
```


See {IERC20-transferFrom}. Emits an {Approval} event indicating the updated allowance. This is not required by the EIP. See the note at the beginning of {ERC20}. NOTE: Does not update the allowance if the current allowance is the maximum `uint256`. Requirements: - `from` and `to` cannot be the zero address. - `from` must have a balance of at least `amount`. - the caller must have allowance for ``from``'s tokens of at least `amount`.
