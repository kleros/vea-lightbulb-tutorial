// SPDX-License-Identifier: MIT

import  "../interfaces/IReceiverGateway.sol";

/**
 *  @authors: [@shotaronowhere, @mani99brar]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.18;

/**
 * @title Lightbulb
 * @dev A lightbulb controlled by a cross-chain switch connected with the Vea bridge.
 **/
 
contract Lightbulb is IReceiverGateway {
    
    address public immutable veaOutbox; // vea bridge on L1
    address public immutable lightBulbSwitch; // The switch on arbitrum that controls this lightbulb.
    mapping (address=>bool) public lightBulbIsOn;
    
    constructor(address _veaOutbox, address _lightBulbSwitch) {
        veaOutbox = _veaOutbox;
        lightBulbSwitch = _lightBulbSwitch;
    }

    modifier onlyAuthenticatedFromVea(address _msgSender) {
        require(msg.sender == veaOutbox, "L1 Auth: Only Vea Bridge.");
        require(_msgSender == lightBulbSwitch, "L2 Auth: Only the switch can turn on the lightbulb.");
        _;
    }

    function senderGateway() external view override returns (address) {
        return lightBulbSwitch;
    }

    /**
    * @dev Receives the message from VeaOutbox and toggles the lightbulb on.
    * @param msgSender The address of the sender on the L2 side.
    * @param msgData The encoded data containing the lightbulb owner's address.
    */
    function receiveMessage(address msgSender, bytes calldata msgData) external override onlyAuthenticatedFromVea(msgSender) {
        (address lightBulbOwner) = abi.decode(msgData, (address));
        lightBulbIsOn[lightBulbOwner] = true;
    }
}