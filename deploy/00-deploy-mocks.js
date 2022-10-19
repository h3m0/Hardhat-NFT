const { deployments, getNamedAccounts, ethers } = require('hardhat');
const { LOCAL } = require("../hasbi");
const { deploy, log } = deployments;

module.exports = async () => {
	let deployer, VRF, LINK;
	const accounts = await ethers.getSigners();
	deployer = accounts[0];

	const chainId = network.config.chainId;
	if (LOCAL.includes(chainId)) {
		console.log("Deploying Mocks...");
		LINK = await deploy(
			"LinkToken", {
				from: deployer.address,
				log: true,
				contract: "LinkToken",
			}
		)
		VRF = await deploy(
			"VRFCoordinatorMock", {
				from: deployer.address,
				log: true,
				contract: "VRFCoordinatorMock",
				args: [LINK.address]
			}
		)
		console.log("Mocks Deployed!");
	}

}