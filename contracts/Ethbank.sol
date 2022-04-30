pragma solidity ^0.8.4;
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Ethbank {
    mapping (address => uint256) public balances;
    using Address for address payable;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdrow() external {
        require(balances[msg.sender] > 0, "no money on sender");

        console.log("================== balance");
        console.log(address(this).balance);
        payable(msg.sender).sendValue(balances[msg.sender]);
        balances[msg.sender] = 0;
    }

     function getCurrentBalance() external view returns (uint) {
         return address(this).balance;
     }

     function getAddress() external view returns (address) {
         return address(this);
     }
}