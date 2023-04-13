import { Badge } from "flowbite-react";
import type { BadgeType } from "./types";

export const RequestedBadge = ({ isVisible }: BadgeType) => {
  return isVisible !== false ? (
    <Badge color="failure" theme={{ root: { base: "font-semibold" } }}>
      Запит
    </Badge>
  ) : (
    <></>
  );
};

export default RequestedBadge;
