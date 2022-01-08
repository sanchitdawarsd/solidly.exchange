# Solid Swap

## TODO:
- [ ] Swaps
    [ ] Swap Assets
    [ ] Create pool
    [ ] Manage liquidity
- [ ] Vote Escrow
    [ ] Locking
    [ ] Voting
- [ ] Gauges
    [ ] Stake
    [ ] Claim
- [ ] bribes
    [ ] Vote
    [ ] Claim

## Getting started
- Make sure to have nodejs installed. This app is built using [Next.js](https://nextjs.org/learn/basics/create-nextjs-app) and [react](https://reactjs.org/docs/getting-started.html).
- Run `npm install`
- Create an account on [infura](https://infura.io/dashboard) and create an [ethereum project](https://infura.io/dashboard/ethereum) there. This will give you an endpoint url that looks like `https://mainnet.infura.io/v3/some_key`. Alternatively, you can also run your own [ethereum rpc server](https://geth.ethereum.org/docs/rpc/server) instead of infura.
- You can now run the nextjs app this way: `NEXT_PUBLIC_PROVIDER=your_infura_endpoint_url npm run dev`
- That's it! You can now start hacking and submit PRs.
