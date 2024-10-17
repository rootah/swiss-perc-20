const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const RootahP20 = await hre.ethers.getContractFactory("RootahP20");

  // Указываем deployer.address в качестве initialOwner
  const token = await RootahP20.deploy(deployer.address);

  // Ждем завершения деплоя контракта
  await token.waitForDeployment();

  // Получаем адрес контракта
  const tokenAddress = await token.getAddress();
  console.log("Rootah P20 deployed to:", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});