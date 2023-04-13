import { Badge } from "flowbite-react";
import type { BadgeType } from "./types";

export const ConfirmedBadge = ({ isVisible }: BadgeType) => {
  return isVisible !== false ? (
    <Badge color="success" theme={{ root: { base: "font-semibold" } }}>
      Підтверджений
    </Badge>
  ) : (
    <></>
  );
};
