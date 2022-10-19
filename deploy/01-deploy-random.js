const { deployments, getNamedAccounts, ethers } = require('hardhat');
const { LOCAL } = require("../hasbi");
const { deploy, log } = deployments;
const chainId = network.config.chainId;

const pinataSDK = require("@pinata/sdk")
const fs = require('fs-extra');
const pinata = pinataSDK(
	'cdde9a32191ff35b7195',
	'25bf1e7a213e211f91f1f322d7c4a366b6d9db10335c494f5eb81bb47c4ee113'
);

const fee = ethers.utils.parseEther("0.25");
const keyhash = '0x0476f9a745b61ea5c0ab224d3a6e4c99f0b02fce4da01143a4f70aa80ae76e8a';
const amount = ethers.utils.parseEther("0.25");

const URIs = [];
const imagepath = "./images";
const metadataTemp = {
	"name": "",
	"description": "",
	"image": "",
	"attributes": [
		{
			"kawaiiFactor": 100,
			"oppaiSize": "Large"
		}
	]
}

module.exports = async () => {
	let deployer, VRF, LINK, RIN, Rargs;
	const accounts = await ethers.getSigners();
	deployer = accounts[0];

	const { responses, files } = await storeImage(imagepath);
	for (file in files) {
		const metadata = {...metadataTemp};
		metadata.name = `${files[file].replace(".png", "")}`
		metadata.description = `A kawaii japanese waifu`;
		metadata.image = responses[file];
		console.log(metadata);
		const URIt = await pinata.pinJSONToIPFS(metadata).IpfsHash;
		const URI = `ipfs://${URIt}`
		console.log(URI);
		URIs.push(URI);
	}	
	console.log(URIs)

	if (LOCAL.includes(chainId)) {
		console.log("Deploying Mocks...")
		VRF = await ethers.getContract("VRFCoordinatorMock");
		LINK = await ethers.getContract("LinkToken");
		Rargs = [
			LINK.address,
			fee,
			VRF.address,
			keyhash,
			URIs
		]

	} else {

		Rargs = [
			network.config.link,
			fee,
			network.config.vrf,
			keyhash,
			URIs
		]
	}	

	RIN = await deploy(
		"RandomIpfsNft", {
			from: deployer.address,
			log: true,
			args: Rargs
		}
	)

	console.log("Funding With Link...");
	const tx = await LINK.transfer(
		RIN.address, amount, {
			from: deployer.address
		}
	);
	await tx.wait(1);
	console.log(`${RIN.address} hasb been funded with ${amount}`);
}

async function storeImage (_imagepath) {
	const files = fs.readdirSync(_imagepath);
	let responses = [];
	for (file in files) {		
		const readableStream = fs.createReadStream(
			`${_imagepath}/${files[file]}`
		);		
		const IpfsImageHash = await pinata.pinFileToIPFS(readableStream).IpfsHash;		
		const ImageURI = `ipfs://${IpfsImageHash}`;
		responses.push(ImageURI);
	}
	console.log(responses);
	return { responses, files };	
}