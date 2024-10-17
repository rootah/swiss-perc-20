const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");
const { ethers } = hre;

// Отправка зашифрованного запроса с подписью на узел
const sendSignedShieldedQuery = async (wallet, destination, data) => {
  if (!wallet.provider) {
    throw new Error("wallet doesn't contain connected provider");
  }

  const [encryptedData, usedEncryptedKey] = await encryptDataField(wallet.provider.connection._url, data);
  const networkInfo = await wallet.provider.getNetwork();
  const nonce = await wallet.getTransactionCount();

  const callData = {
    nonce: ethers.utils.hexValue(nonce),
    to: destination,
    data: encryptedData,
    chainId: networkInfo.chainId,
  };

  const signedRawCallData = await wallet.signTransaction(callData);
  const decoded = ethers.utils.parseTransaction(signedRawCallData);

  const signedCallData = {
    nonce: ethers.utils.hexValue(nonce),
    to: decoded.to,
    data: decoded.data,
    v: ethers.utils.hexValue(decoded.v),
    r: ethers.utils.hexValue(decoded.r),
    s: ethers.utils.hexValue(decoded.s),
    chainId: ethers.utils.hexValue(networkInfo.chainId),
  };

  const response = await wallet.provider.send('eth_call', [signedCallData, "latest"]);
  return await decryptNodeResponse(wallet.provider.connection._url, response, usedEncryptedKey);
};

// Получение баланса токена с помощью функции sendSignedShieldedQuery
const getTokenBalance = async (wallet, contract) => {
  const req = await sendSignedShieldedQuery(
    wallet,
    contract.address,
    contract.interface.encodeFunctionData("getBalance", [wallet.address])
  );
  const balance = contract.interface.decodeFunctionResult("getBalance", req)[0];
  return balance;
};

async function main() {
  const contractAddress = "0xa2b5747F828dAFF3c9123550a8b90b3f542f44F0";
  const [signer] = await hre.ethers.getSigners();

  console.log("Signer address:", signer.address);

  const RootahP20 = await hre.ethers.getContractAt("RootahP20", contractAddress);

  try {
    console.log("Fetching token balance...");
    const balance = await getTokenBalance(signer, RootahP20);
    console.log(`Balance of account ${signer.address}:`, ethers.formatUnits(balance, 18), "pRTH");
  } catch (error) {
    console.error("Error fetching balance:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});