// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PERC20.sol";

contract RootahP20 is PERC20, Ownable {
    constructor(address initialOwner) PERC20("Rootah P20", "pRTH") {
        transferOwnership(initialOwner); // Передаем владение владельцу
        _mint(initialOwner, 1000 * 10 ** decimals()); // Начальная эмиссия токенов владельцу
    }

    // Метод для выпуска токенов
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Специальный метод для владельца для получения баланса любого аккаунта
    function getBalance(address account) public view onlyOwner returns (uint256) {
        return super.balanceOf(account);
    }

    // Переопределение функции allowance для PERC-20 стандарта
    function allowance(address owner, address spender) public view override returns (uint256) {
        require(msg.sender == spender, "RootahP20: msg.sender != spender");
        return super.allowance(owner, spender);
    }
}