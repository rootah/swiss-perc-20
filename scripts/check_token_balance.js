const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

async function sendShieldedQuery(provider, destination, data) {
  const rpclink = hre.network.config.url;
  const [encryptedData, usedEncryptedKey] = await encryptDataField(rpclink, data);
  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });
  return await decryptNodeResponse(rpclink, response, usedEncryptedKey);
}

async function main() {
  const contractAddress = "0x436EfBdB6edbE7e69ee4B69D9dcaBf2C73120016"; // Адрес контракта токена
  const [signer] = await hre.ethers.getSigners();
  const accountAddress = signer.address; // Используем адрес подписанта для проверки баланса

  const RootahP20 = await hre.ethers.getContractAt("RootahP20", contractAddress);

  try {
    // Код данных для получения баланса через getBalance
    const getBalanceData = RootahP20.interface.encodeFunctionData("getBalance", [accountAddress]);
    const balanceResponse = await sendShieldedQuery(hre.ethers.provider, contractAddress, getBalanceData);
    const [balance] = RootahP20.interface.decodeFunctionResult("getBalance", balanceResponse);
    console.log(`Balance of account ${accountAddress}:`, hre.ethers.formatUnits(balance, 18), "pRTH");
  } catch (error) {
    console.error("Error fetching balance:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
