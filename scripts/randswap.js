const ethers = require('ethers');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const erc20Abi = require("../erc20.json")
const wethArtifact = require("../weth.json")

WETH_ADDRESS= '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
USDT_ADDRESS= '0xdAC17F958D2ee523a2206206994597C13D831ec7'
ROUTER_ADDRESS= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
PAIR_ADDRESS= '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852'

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/')
const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
const signer = wallet.connect(provider)

const router = new ethers.Contract(ROUTER_ADDRESS, routerArtifact.abi, provider)
const usdt = new ethers.Contract(USDT_ADDRESS, erc20Abi, provider)
const weth = new ethers.Contract(WETH_ADDRESS, wethArtifact.abi, provider)

const logBalances = async () => {
    const ethBalance = await provider.getBalance(signer.address)
    const usdtBalance = await usdt.balanceOf(signer.address)
    const wethBalance = await weth.balanceOf(signer.address)
    console.log('--------------------')
    console.log('ETH Balance:', ethers.formatUnits(ethBalance, 18))
    console.log('WETH Balance:', ethers.formatUnits(wethBalance, 18))
    console.log('USDT Balance:', ethers.formatUnits(usdtBalance, 6))
    console.log('--------------------')
}

const main = async () => {

    const bn = await provider.getBlockNumber();
    console.log('Block Number:', bn);

    const intAmountIn = Math.floor(Math.random() * 100) + 1; // Random value between 1 and 100

    await signer.sendTransaction({
        to: WETH_ADDRESS,
        value: ethers.parseUnits(intAmountIn.toString(), 18)
    })
    logBalances()

    let nonce = await provider.getTransactionCount(signer.getAddress());
    
    const amountIn = ethers.parseUnits(intAmountIn.toString(), 18)
    const tx1 = await weth.connect(signer).approve(router.target, amountIn, { nonce })
    tx1.wait()

    nonce++;
    const tx2 = await router.connect(signer).swapExactTokensForTokens(
        amountIn,
        0,
        [WETH_ADDRESS, USDT_ADDRESS],
        signer.address,
        Math.floor(Date.now() / 1000) + (60 * 10),
        {
            gasLimit: 1000000,
            nonce: nonce,
        }
    )
    await tx2.wait()

    logBalances()
}
setInterval(main, 10000);
