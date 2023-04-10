pragma solidity ^0.8.0;

interface IFeeFactory {
    function platformWallet() external view returns(address payable);
}