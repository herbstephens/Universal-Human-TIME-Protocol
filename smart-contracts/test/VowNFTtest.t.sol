// test/VowNFTTest.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VowNFT.sol"; // adjust path if needed

contract VowNFTTest is Test {
    VowNFT public vow;
    address public alice = address(0xA1);
    address public bob = address(0xB2);
    address public stranger = address(0xC3);
    bytes32 public marriageId;
    bytes32 constant SAMPLE_MARRIAGE_ID = 0xcb19919446850e9100c23ccc300afeb40e2bb3dbc80ffd0925f159d99a0c2034;

    function setUp() public {
        // deploy and set this test contract as the authorized minter (humanBondContract)
        vow = new VowNFT();
        vow.setHumanBondContract(address(this));
        marriageId = keccak256(abi.encodePacked("marriage-1"));
    }

    /* ---------------------------
       Helpers
       --------------------------- */
    function _startsWith(string memory what, string memory prefix) internal pure returns (bool) {
        bytes memory w = bytes(what);
        bytes memory p = bytes(prefix);
        if (w.length < p.length) return false;
        for (uint256 i = 0; i < p.length; i++) {
            if (w[i] != p[i]) return false;
        }
        return true;
    }

    function _contains(string memory what, string memory needle) internal pure returns (bool) {
        bytes memory w = bytes(what);
        bytes memory n = bytes(needle);
        if (n.length > w.length) return false;
        for (uint256 i = 0; i <= w.length - n.length; i++) {
            bool ok = true;
            for (uint256 j = 0; j < n.length; j++) {
                if (w[i + j] != n[j]) {
                    ok = false;
                    break;
                }
            }
            if (ok) return true;
        }
        return false;
    }

    /* ---------------------------
       Minting / metadata tests
       --------------------------- */

    function test_mint_recordsMetadataAndMapping_slot0() public {
        uint256 tid1 = vow.mintVowNFT(alice, alice, bob, 1_610_000_000, marriageId);
        assertEq(tid1, 1);

        // mapping => slot0 filled, slot1 zero
        uint256[2] memory tokens = vow.getTokensByMarriage(marriageId);
        assertEq(tokens[0], 1);
        assertEq(tokens[1], 0);

        (address pA, address pB, uint256 bondStart, bytes32 mid) = vow.getTokenMetadata(1);
        assertEq(pA, alice);
        assertEq(pB, bob);
        assertEq(bondStart, 1_610_000_000);
        assertEq(mid, marriageId);
    }

    function test_secondMint_fillsSlot1() public {
        uint256 t1 = vow.mintVowNFT(alice, alice, bob, 1, marriageId);
        uint256 t2 = vow.mintVowNFT(bob, alice, bob, 1, marriageId);

        assertEq(t1, 1);
        assertEq(t2, 2);

        uint256[2] memory tokens = vow.getTokensByMarriage(marriageId);
        assertEq(tokens[0], 1);
        assertEq(tokens[1], 2);
    }

    function test_thirdMint_reverts_with_max_two() public {
        vow.mintVowNFT(alice, alice, bob, 1, marriageId);
        vow.mintVowNFT(bob, alice, bob, 1, marriageId);

        // third mint for same marriageId should revert with "max is 2"
        vm.expectRevert(bytes("max is 2"));
        vow.mintVowNFT(stranger, alice, bob, 1, marriageId);
    }

    function test_tokenURI_hasDataPrefixAndImageCID() public {
        vow.mintVowNFT(alice, alice, bob, 1_610_000_000, marriageId);
        string memory uri = vow.tokenURI(1);

        assertTrue(_startsWith(uri, "data:application/json;base64,"), "must return data URI");
        // check the contract stores the expected imageCID (tokenURI is built from this)
        assertEq(vow.imageCID(), "ipfs://QmS5Aqic36eFsGvmGsPDBD3VhfTyY7W1E7Sk7jTrAuKtqo");
    }

    function test_console_log_tokenURI_for_manual_inspection() public {
        uint256 t1 = vow.mintVowNFT(alice, alice, bob, 1_610_000_000, SAMPLE_MARRIAGE_ID);
        string memory uri = vow.tokenURI(t1);

        // prints during `forge test -vv` so you can copy/paste to a browser or base64 decoder
        console.log("tokenURI(1) =>");
        console.log(uri);

        // basic sanity asserts
        assertTrue(bytes(uri).length > 0);
        assertTrue(_startsWith(uri, "data:application/json;base64,"));
    }

    /* ---------------------------
       Access control tests
       --------------------------- */

    function test_setImageCID_onlyOwner() public {
        // owner (this contract) can set
        vow.setImageCID("ipfs://NEWCID");
        // non-owner cannot
        vm.prank(address(0xDEAD));
        vm.expectRevert(); // Ownable reverts — exact message can vary by OZ version
        vow.setImageCID("ipfs://NOPE");
    }

    function test_setHumanBondContract_onlyOwner() public {
        // owner (this) can set
        vow.setHumanBondContract(address(0x111));
        // restore to this
        vow.setHumanBondContract(address(this));

        // non-owner cannot set
        vm.prank(address(0x999));
        vm.expectRevert();
        vow.setHumanBondContract(address(0x999));
    }

    /* ---------------------------
       Soulbound / transfer prevention
       --------------------------- */

    function test_transfer_reverts_with_VowNFT__TransfersDisabled() public {
        // mint token id 1 to alice
        vow.mintVowNFT(alice, alice, bob, 1, marriageId);

        // attempt to transfer from alice -> stranger, should revert with custom error
        vm.prank(alice);
        vm.expectRevert(VowNFT.VowNFT__TransfersDisabled.selector);
        vow.transferFrom(alice, stranger, 1);
    }
}
