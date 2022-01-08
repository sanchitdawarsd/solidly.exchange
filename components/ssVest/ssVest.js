import React, { useState, useEffect } from "react";
import BigNumber from "bignumber.js";
import classes from "./ssVest.module.css";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants";
import moment from "moment";

import Lock from "./lock";
import ExistingLock from "./existingLock";
import NoBalances from "./noBalances";
import Unlock from "./unlock";
import Loading from "./loading";

export default function ssVest() {
  const [govToken, setGovToken] = useState(null);
  const [veToken, setVeToken] = useState(null);

  useEffect(() => {
    const forexUpdated = () => {
      setGovToken(stores.stableSwapStore.getStore("govToken"));
      setVeToken(stores.stableSwapStore.getStore("veToken"));
    };

    setGovToken(stores.stableSwapStore.getStore("govToken"));
    setVeToken(stores.stableSwapStore.getStore("veToken"));

    stores.emitter.on(ACTIONS.FIXED_FOREX_UPDATED, forexUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.FIXED_FOREX_UPDATED, forexUpdated);
    };
  }, []);

  return (
    <>
      {!govToken && !veToken && <Loading />}
      {govToken && veToken && (!govToken.balance || BigNumber(govToken.balance).eq(0)) && (!veToken.balance || BigNumber(veToken.balance).eq(0)) && (!veToken.vestingInfo || !veToken.vestingInfo.lockEnds || BigNumber(veToken.vestingInfo.lockEnds).eq(0)) && (
        <NoBalances
          govToken={govToken}
        />
      )}
      {govToken && veToken && BigNumber(govToken.balance).gt(0) && BigNumber(veToken.balance).eq(0) && (
        <Lock
          govToken={govToken}
          veToken={veToken}
        />
      )}
      {veToken && BigNumber(veToken.balance).gt(0) && (
        <ExistingLock
          govToken={govToken}
          veToken={veToken}
          expired={false}
        />
      )}
      {
        veToken && veToken.vestingInfo && BigNumber(veToken.vestingInfo.lockEnds).lte(moment().unix()) && BigNumber(veToken.vestingInfo.lockEnds).gt(0) && (
          <Unlock />
        )
      }
    </>
  );
}
