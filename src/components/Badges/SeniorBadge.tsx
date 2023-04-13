import { Badge } from "flowbite-react";
import type { BadgeType } from "./types";

export const SeniorBadge = ({ isVisible }: BadgeType) => {
  return isVisible !== false ? (
    <Badge color="indigo" theme={{ root: { base: "font-semibold" } }}>
      Староста
    </Badge>
  ) : (
    <></>
  );
};

export default SeniorBadge;
