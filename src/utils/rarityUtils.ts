// utils/rarityUtils.ts

import blackWhiteRare from "@/assets/rarity/black_white_rare.png";
import common from "@/assets/rarity/common.png";
import doubleRare from "@/assets/rarity/double_rare.png";
import hyperRare from "@/assets/rarity/hyper_rare.png";
import illustrationRare from "@/assets/rarity/illustration_rare.png";
import megaHyperRare from "@/assets/rarity/mega_hyper_rare.png";
import rare from "@/assets/rarity/rare.png";
import shinyRare from "@/assets/rarity/shiny_rare.png";
import shinyUltraRare from "@/assets/rarity/shiny_ultra_rare.png";
import specialIllustrationRare from "@/assets/rarity/special_illustration_rare.png";
import ultraRare from "@/assets/rarity/ultra_rare.png";
import uncommon from "@/assets/rarity/uncommon.png";
import blackStarPromo from "@/assets/rarity/black_star_promo.png";

const RARITY_IMAGE_MAP: Record<string, string | null> = {
  // ── Direct matches ──────────────────────────────────────────────
  "ACE SPEC Rare": ultraRare,
  "Amazing Rare": rare,
  "Black White Rare": blackWhiteRare,
  "Black Star Promo": blackStarPromo,
  "Classic Collection": blackWhiteRare,
  Common: common,
  Crown: megaHyperRare,
  "Double rare": doubleRare,
  "Four Diamond": doubleRare,
  "Full Art Trainer": ultraRare,
  "Holo Rare": rare,
  "Holo Rare V": ultraRare,
  "Holo Rare VMAX": ultraRare,
  "Holo Rare VSTAR": ultraRare,
  "Hyper rare": hyperRare,
  "Illustration rare": illustrationRare,
  LEGEND: blackWhiteRare,
  "Mega Hyper Rare": megaHyperRare,
  None: null,
  "One Diamond": common,
  "One Shiny": shinyRare,
  "One Star": ultraRare,
  "Radiant Rare": illustrationRare,
  Rare: rare,
  "Rare Holo": rare,
  "Rare Holo LV.X": ultraRare,
  "Rare PRIME": ultraRare,
  "Secret Rare": hyperRare,
  "Shiny Ultra Rare": shinyUltraRare,
  "Shiny rare": shinyRare,
  "Shiny rare V": shinyRare,
  "Shiny rare VMAX": shinyUltraRare,
  "Special illustration rare": specialIllustrationRare,
  "Three Diamond": rare,
  "Three Star": specialIllustrationRare,
  "Two Diamond": uncommon,
  "Two Shiny": shinyRare,
  "Two Star": illustrationRare,
  "Ultra Rare": ultraRare,
  Uncommon: uncommon,
};

export const getRarityImage = (
  rarity: string,
  setName: string = "",
): string | null => {
  rarity = setName.includes("promo") ? "Black Star Promo" : rarity;
  return RARITY_IMAGE_MAP[rarity] ?? null;
};
