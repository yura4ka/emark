import { Badge } from "flowbite-react";
import type { BadgeType } from "./types";

export const AdminBadge = ({ isVisible }: BadgeType) => {
  return isVisible !== false ? (
    <Badge color="purple" theme={{ root: { base: "font-semibold" } }}>
      Адміністратор
    </Badge>
  ) : (
    <></>
  );
};
