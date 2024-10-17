const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");

async function sendShieldedTransaction(signer, destination, data) {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value: 0,
  });
}

async function main() {
  const contractAddress = "0x436EfBdB6edbE7e69ee4B69D9dcaBf2C73120016"; // Адрес контракта токена
  const [signer] = await hre.ethers.getSigners();

  console.log("Deploying from account address:", signer.address);

  const RootahP20 = await hre.ethers.getContractAt("RootahP20", contractAddress);

  // Выполняем минтинг токенов
  const mintAmount = hre.ethers.parseUnits("100", 18); // Минтим 100 токенов
  console.log(`Minting 100 tokens (in units: ${mintAmount.toString()}) to address: ${signer.address}`);

  try {
    // Генерация данных для вызова функции "mint"
    console.log("Encoding mint function data...");
    const mintData = RootahP20.interface.encodeFunctionData("mint", [signer.address, mintAmount]);
    console.log("Mint data encoded successfully.");

    // Отправка зашифрованной транзакции
    console.log("Encrypting and sending the transaction...");
    const mintTx = await sendShieldedTransaction(signer, contractAddress, mintData);
    console.log("Transaction sent, awaiting confirmation...");

    await mintTx.wait();
    console.log("Tokens minted successfully. Transaction hash:", mintTx.hash);
  } catch (error) {
    console.error("Error during minting:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
