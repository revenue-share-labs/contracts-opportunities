pragma solidity ^0.8.19;

interface IFeeFactory {
    function platformWallet() external view returns (address payable);
}
