"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

/** 購読不要（マウント判定にしか使わない） */
const subscribe = (): (() => void) => () => {};

/**
 * オーバーレイを document.body 直下に描画する。
 *
 * TopBar は `backdrop-blur` を持つが、filter / backdrop-filter を持つ要素は
 * 配下の `position: fixed` の含みブロックになる。そのため header の中に置いた
 * オーバーレイはビューポートではなくヘッダーの矩形を基準に配置され、
 * 本文の下に潜り込んでしまう。ポータルで外に出してこれを回避する。
 * @param children 描画する内容
 * @returns body 直下に描画されたノード（サーバー描画時は null）
 */
export const Portal = ({ children }: PortalProps) => {
  // サーバーでは false、クライアントにマウントされたら true
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) return null;
  return createPortal(children, document.body);
};
