//const this simply mints a random nft to a user
const { getNamedAccounts, deployments, ethers } = require('hardhat');
const value = ethers.utils.parseEther("1");
const gvalue = ethers.utils.parseEther("0.2");

async function main() {

	const { tester, deployer } = await getNamedAccounts();
	console.log("Minting a random nft...")
	const MINTC = await ethers.getContract("RandomIpfsNft");

	 await MINTC.connect(tester);
	
	const tx = await MINTC.requestNFT({	
		gasLimit: gvalue,
		from: deployer,
		value: value
	});
	await tx.wait(1);

	const WT = await MINTC.checkWaifu(tester);
	const WaifuType = WT.toString();

	const U = await MINTC.tokenURIWithAddress(tester);
	const URI = await U.toString();

	console.log(`Congrats You got the ${WaifuType} NFT! check your NFT out at ${URI}`)
}

main()
.then(() => process.exit(0))
.catch((error) => {
	console.error(error)
	process.exit(1)
})