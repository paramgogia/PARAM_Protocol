// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// interface IMintablePTK {
//     function mint(address to, uint256 amount) external;
//     function balanceOf(address account) external view returns (uint256);
// }

// contract ParamProtocol is ERC721URIStorage, Ownable {
//     IMintablePTK public ptkToken;
//     uint256 public tokenIdCounter;
//     uint256 public rewardAmount = 10 * 10**18; // 10 PTK

//     // Track NFT contributors and their tokens
//     mapping(uint256 => address) private _nftContributor;
//     mapping(address => uint256[]) private _contributorNFTs;

//     event DataNFTMinted(address indexed contributor, uint256 tokenId, string cid);
//     event RewardMinted(address indexed contributor, uint256 amount);

//     constructor(address _ptkTokenAddress) 
//         ERC721("ParamProtocolDataNFT", "PPDNFT")
//         Ownable(msg.sender)
//     {
//         ptkToken = IMintablePTK(_ptkTokenAddress);
//     }

//     /// @notice Mint NFT for IPFS CID and reward contributor
//     function mintDataNFT(string calldata _cid, address _contributor) external onlyOwner {
//         require(_contributor != address(0), "Invalid contributor");

//         uint256 newTokenId = tokenIdCounter + 1;
//         _safeMint(_contributor, newTokenId);
//         _setTokenURI(newTokenId, _cid);
//         tokenIdCounter = newTokenId;

//         // Track contributor
//         _nftContributor[newTokenId] = _contributor;
//         _contributorNFTs[_contributor].push(newTokenId);

//         emit DataNFTMinted(_contributor, newTokenId, _cid);

//         // Mint PTK directly to contributor
//         ptkToken.mint(_contributor, rewardAmount);
//         emit RewardMinted(_contributor, rewardAmount);
//     }

//     /// @notice Change PTK reward amount
//     function setRewardAmount(uint256 _newAmount) external onlyOwner {
//         rewardAmount = _newAmount;
//     }

//     /// ---------------- GETTER FUNCTIONS ----------------

//     function getContributor(uint256 tokenId) external view returns (address) {
//         return _nftContributor[tokenId];
//     }

//     function getNFTsByContributor(address contributor) external view returns (uint256[] memory) {
//         return _contributorNFTs[contributor];
//     }

//     function getCID(uint256 tokenId) external view returns (string memory) {
//         return tokenURI(tokenId);
//     }

//     function getTotalNFTs() external view returns (uint256) {
//         return tokenIdCounter;
//     }

//     function getRewardAmount() external view returns (uint256) {
//         return rewardAmount;
//     }

//     function getNFTOwner(uint256 tokenId) external view returns (address) {
//         return ownerOf(tokenId);
//     }
//     /// @notice Helper function to check any address's PTK balance
//     function getPtkBalance(address _user) external view returns (uint256) {
//         return ptkToken.balanceOf(_user);
//     }



//deployed on remix IDE 
// // }
// import ParamProtocolABI from '../../../parampyth.json'; // Reusing the same file

// // --- 2. ADD YOUR DEPLOYED ParamProtocol ADDRESS ---
// const PARAM_PROTOCOL_ADDRESS = "0xbF26F622e0322cc7eC12561f897f397B390F97b7";