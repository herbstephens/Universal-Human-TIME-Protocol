deploy:
	forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast
	forge script script/Deploy.s.sol:DeployScript --rpc-url https://worldchain-sepolia.g.alchemy.com/v2/hr0u6gssX4yzR3YaMJd5n29e7Cwk79LT --private-key $SEPOLIA_PK --broadcast

propose:
	cast send 0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6 \
"propose(address,uint256,uint256,uint256[8])" \
0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 1111 '[0,0,0,0,0,0,0,0]' \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --rpc-url http://localhost:8545

accept:
	cast send 0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6 \
"accept(address,uint256,uint256,uint256[8])" \
0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1 2222 '[0,0,0,0,0,0,0,0]' \
--private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d --rpc-url http://localhost:8545

claim-yield:
	cast send 0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6 \
"claimYield(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
--rpc-url http://localhost:8545

divorce:
	cast send 0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6 \
"divorce(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
--rpc-url http://localhost:8545

check-balances:
	cast call 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0 "balanceOf(address)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
	cast call 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0 "balanceOf(address)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

check-current-block:
	cast block latest --rpc-url http://localhost:8545

fast-forward-oneyear:
	cast rpc evm_increaseTime 31538000 --rpc-url http://localhost:8545
    cast rpc evm_mine --rpc-url http://localhost:8545

check-upkeep:
	cast call 0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6 "checkUpkeep(bytes)" 0x --rpc-url http://localhost:8545

perform-upkeep:
	cast send 0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6 "performUpkeep(bytes)" 0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000157c5f953caeb89e84f86eb06388e9c2823db25540a7a5ed098b392e8ca272132 \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
--rpc-url http://localhost:8545

