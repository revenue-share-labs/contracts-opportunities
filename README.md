# Valve - Opportunities

This repository contains a smart contracts that will allocate one-time payment and revenue share payments.

## Key takeways

1. The main ideas of this contracts is to redistribute tokens (whether they are ERC-20 or native cryptocurrency), to the participants based on the percentages assigned to them.
   - Percentages may have up to 5 decimal points.
   - The sum of all percentages must always be equal to 100% percentageSum == 10000000
1. Every native cryptocurrency sent to this contract address can be redistributed according to the rules either in real-time or manually, as determined by setting the isAutoNativeCurrencyDistribution to true of false.
1. Every ERC-20 token must be manually redistributed using the redistributeToken() method.
1. The contract can redistribute arbitrary number of tokens between recipients, and it is not possible to have a contract without recipients or with less than 100% shares assigned.
1. The distribution of native cryptocurrency and ERC-20 tokens can only be done by the one of the distributors. Distributors can be added or removed by the owner. However, native cryptocurrency distribution can be done by anyone if isAutoNativeCurrencyDistribution is true.
1. The recipients can only be changed by the controller. If controller is zero address, then recipients cannot be changed. In this case we refer to it as immutable recipients, however the contract itself does not have immutability attribute for recipients.
1. Controller can be changed by the owner of the Valve contract only if (both statements below should pass):
   - Controller is NOT zero address
   - isImmutableController is FALSE

## Actors and use cases

- owner → Address that has the capability to set the distributor / controller;
- recipients → Addresses which will receive redistributed currency or ERC-20 tokens according to percentage;
- distributors → Addresses which can distribute ERC-20 tokens locked in contract;
- controller → Address which can set recipients. If none (assigned to 0 address) then contract is immutable;
- factory → Address of the factory that was used for contract creation. It is used for getting platformWallet which receives Fee from contract usage;