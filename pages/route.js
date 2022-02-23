import Swap from "./swap";
import Liquidity from "./liquidity";
import LiquidityAddress from "./liquidity/[address]";
import Vest from "./vest";
import Vote from "./vote";
import Rewards from "./rewards";
import Whitelist from "./whitelist";
import Bribe from "./bribe/create";

import { useRouter } from "next/router";

function Route({ changeTheme, ...props }) {
  const router = useRouter();
  const activePath = router.asPath;
  if (activePath.includes("/swap")) {
    return <Swap props={props} changeTheme={changeTheme} />;
  } else if (activePath.includes("/liquidity")) {
    if(activePath.includes("/liquidity/0x")) {
      return <LiquidityAddress props={props} changeTheme={changeTheme} />;
    } else {
      return <Liquidity props={props} changeTheme={changeTheme} />;
    }
  } else if (activePath.includes("/vest")) {
    return <Vest props={props} changeTheme={changeTheme} />;
  } else if (activePath.includes("/vote")) {
    return <Vote props={props} changeTheme={changeTheme} />;
  } else if (activePath.includes("/rewards")) {
    return <Rewards props={props} changeTheme={changeTheme} />;
  } else if (activePath.includes("/whitelist")) {
    return <Whitelist props={props} changeTheme={changeTheme} />;
  } else if (activePath.includes("/bribe")) {
    return <Bribe props={props} changeTheme={changeTheme} />;
  } else if (activePath.includes("/")) {
    return <Swap props={props} changeTheme={changeTheme} />;
  } else {
    return <Swap props={props} changeTheme={changeTheme} />;
  }
}

export default Route;
