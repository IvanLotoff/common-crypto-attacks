const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
// https://ethereum.stackexchange.com/questions/110118/how-to-change-the-scope-of-a-variable-in-a-hardhat-test-written-in-typescript
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {Ethbank, Attacker} from "../typechain";


describe("test reentraring attack", async () => {
    let _attacker: any, attacker: Attacker, _ethbank: any, ethbank: Ethbank
    let bankOwner: SignerWithAddress, attackerOwner: SignerWithAddress, bankClient: SignerWithAddress;

    beforeEach("Deploy the contract", async function () {
        // Get first three mock contracts
        [bankOwner, attackerOwner, bankClient] = await ethers.getSigners(); 
        // prepare Ethbank contract to deploy, bankOwner is who deployed it
        _ethbank = await ethers.getContractFactory('Ethbank', bankOwner);
        // start deploying transaction
        ethbank = await _ethbank.deploy();
        // wait until deploying transaction is completed
        await ethbank.deployed();

        // same as above
        _attacker = await ethers.getContractFactory('Attacker', attackerOwner);
        // deploy attacker contract with bank address passed to constructor
        attacker = await _attacker.deploy(ethbank.getAddress());
        await attacker.deployed();

        // bank client do deposit with 50 wei
        const tx = await ethbank.connect(bankClient).deposit({value: 50});

        // get bank balance and assert it to be 50 wei
        const balance = await ethbank.getCurrentBalance();
        expect(balance).to.eq(50);
    });

    it("try attacking", async ()=> {
        const initialBankBalance = await ethbank.getCurrentBalance();
        console.log("initial balance is: ", initialBankBalance);

        // do fragelent transaction
        await attacker.connect(attackerOwner).attack({value: 5});
        
        // now the balance should be reduced by 5 wei
        const balanceAfterAttack = await ethbank.getCurrentBalance();
        console.log("balance after attack is: ", balanceAfterAttack);
        
        expect(initialBankBalance.sub(balanceAfterAttack)).to.eq(5)
    })
})