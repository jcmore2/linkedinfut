import { renderCard } from "./renderCard.js";
import { renderCardTcg } from "./renderCardTcg.js";
import type { CardData, CardStyle } from "./types.js";

export function renderCardStyled(data: CardData, style: CardStyle): string {
  return style === "tcg" ? renderCardTcg(data) : renderCard(data);
}
