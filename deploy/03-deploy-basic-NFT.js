const { hre, ethers } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {

	const { deploy, log } = deployments;
	const { deployer, tester } = await getNamedAccounts();
	log("=================================================");
	const BASIC = await deploy("BasicNFT", {
		from: deployer,
		log: true,
		contract: "BasicNFT",
		waitConfirmations: 1
	})
	log("=================================================");

}




