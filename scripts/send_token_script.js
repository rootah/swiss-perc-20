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
  const recipientAddress = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1"; // Адрес получателя
  const [signer] = await hre.ethers.getSigners();

  console.log("Deploying from account address:", signer.address);

  const RootahP20 = await hre.ethers.getContractAt("RootahP20", contractAddress);

  // Выполняем перевод токенов
  const transferAmount = hre.ethers.parseUnits("1", 18); // Отправляем 1 токен
  console.log(`Transferring 1 token (in units: ${transferAmount.toString()}) to address: ${recipientAddress}`);

  try {
    // Генерация данных для вызова функции "transfer"
    console.log("Encoding transfer function data...");
    const transferData = RootahP20.interface.encodeFunctionData("transfer", [recipientAddress, transferAmount]);
    console.log("Transfer data encoded successfully.");

    // Отправка зашифрованной транзакции
    console.log("Encrypting and sending the transaction...");
    const transferTx = await sendShieldedTransaction(signer, contractAddress, transferData);
    console.log("Transaction sent, awaiting confirmation...");

    await transferTx.wait();
    console.log("Token transferred successfully. Transaction hash:", transferTx.hash);
  } catch (error) {
    console.error("Error during token transfer:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
