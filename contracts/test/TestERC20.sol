// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
    address public minter;
    uint256 public constant MAX_SUPPLY = 5 * 1e12 * 1e18; // 5 trilion

    constructor() ERC20("TokenX", "TX") {
        minter = address(0);
    }

    /**
     * @dev Throws if sender is not minter
     */
    modifier onlyMinter() {
        require(msg.sender == minter, "Sender is not minter");
        _;
    }

    /**
     * @notice mint of xla tokens
     * @param _to receiver of tokens
     * @param _amount amount of tokens to mint
     */
    function mint(address _to, uint256 _amount) external onlyMinter {
        require(
            MAX_SUPPLY >= totalSupply() + _amount,
            "MAX_SUPPLY was reached, unable to mint more tokens"
        );
        _mint(_to, _amount);
    }

    /**
     * @notice Allow to change minter address for admin
     * @param _minter new minter address
     */
    function setMinter(address _minter) external onlyOwner {
        require(minter == address(0), "Minter already configured");
        minter = _minter;
    }
}
