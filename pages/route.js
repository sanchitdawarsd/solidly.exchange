import Swap from "./swp";

import { useRouter } from "next/router";

function Route({ changeTheme, ...props }) {
  const router = useRouter();
  const activePath = router.asPath;
  if (activePath.includes("/")) {
    return <Swap props={props} changeTheme={changeTheme} />;
  } else {
    return <Swap props={props} changeTheme={changeTheme} />;
  }
}

export default Route;
