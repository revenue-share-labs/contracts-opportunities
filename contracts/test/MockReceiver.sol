// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../Opportunities.sol";

error CantAcceptEtherDirectly();

contract MockReceiver {
    Opportunities public opportunities;

    receive() external payable {
        revert CantAcceptEtherDirectly();
    }

    constructor(address payable _opportunities) {
        opportunities = Opportunities(_opportunities);
    }

    function testRedistributeNativeCurrency(uint256 _amount, uint256 _index) external {
        opportunities.redistributeNativeCurrency(_amount, _index);
    }
}
