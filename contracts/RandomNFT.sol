//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract RandomIpfsNft is VRFConsumerBase, ERC721 {

	error NotEnoughETH();
	error SomethingisWrong();

	event requestNft(bytes32 requestId);
	
	uint private fee;
	uint private immutable price = 1 ether;
	uint private newTokenId;
	string[] private URIs; //Must be in order of 'Waifu' enum
	bytes32 private keyhash;
	address private link;
	enum Waifu { YUMEKO, HINATA, YUROICHI }
	uint private randomResult;	
	mapping(uint256 => address) private IdToOwner;
	mapping(uint256 => string) private tokenToURI;	
	mapping(address => string) private OwnerToURI;
	mapping(address => Waifu) private OwnerToWaifu;

	constructor(
		address _link,
		uint256 _fee,
		address _vrf,
		bytes32 _keyhash,
		string[] memory  _URis
	) public VRFConsumerBase(
		_vrf,
		_link
	) ERC721("RandomIpfsNft", "WAIFU") {
		keyhash = _keyhash;
		fee = _fee;
		URIs = _URis;
	}	

	function requestNFT() public payable {
		if(msg.value < price){
			revert NotEnoughETH();
		}
		requestRandomness(keyhash, fee);
		IdToOwner[newTokenId] = msg.sender;
	}

	function fulfillRandomness(bytes32 _requestId, uint _randomness) internal override {
		randomResult = _randomness;
		address requester = IdToOwner[newTokenId];
		Waifu waifu = getWaifu();		
		tokenToURI[newTokenId] = URIs[uint256(waifu)];
		OwnerToURI[requester] = URIs[uint256(waifu)];
		OwnerToWaifu[requester] = waifu;
		_safeMint(requester, newTokenId);
		emit requestNft(_requestId);
	}

	function getWaifu() public view returns(Waifu){
		uint chance = randomResult % 100;
		if(chance >= 0 && chance <= 10){
			return Waifu.YUMEKO;
		}else if (chance > 10 && chance <= 30) {
			return Waifu.HINATA;
		}else if(chance > 30 && chance <= 100) {
			return Waifu.YUROICHI;
		} else {
			revert SomethingisWrong();
		}
	}

	function tokenURI(uint _tokenId) public view override returns(string memory){
		return tokenToURI[_tokenId];
	}

	function tokenURIWithAddress(address _address) public view returns(string memory) {
		return OwnerToURI[_address];
	}
	
	function checkWaifu(address _address) public view returns(Waifu) {
		return OwnerToWaifu[_address];
	}
}