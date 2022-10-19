const { deployments } = require('hardhat');

module.exports = async () => {
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;
	const accounts = await ethers.getSigners();

	console.log("Deploying Market Place...");
	const MARKET = await deploy(
		"Market", {
			from: deployer,
			log: true,
			contract: "Market",
		}
	)
}