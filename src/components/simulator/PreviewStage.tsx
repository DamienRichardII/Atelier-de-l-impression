"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Path, Rect, Ellipse, Image as KImage, Transformer, Group } from "react-konva";
import type Konva from "konva";
import type { PrintZone } from "@/config/products";
import type { LogoPlacement } from "@/lib/customization/types";

export const W = 500;
export const H = 560;

// Silhouettes 2D simplifiées (en attendant photos/modèles 3D fournis par le client).
const SHAPES: Record<string, string> = {
  shirt: "M170 40 L100 70 L20 150 L75 200 L115 165 L115 520 L385 520 L385 165 L425 200 L480 150 L400 70 L330 40 Q250 95 170 40 Z",
  sweat: "M165 40 L95 70 L10 190 L60 235 L112 190 L112 520 L388 520 L388 190 L440 235 L490 190 L405 70 L335 40 Q250 100 165 40 Z",
  tote: "M110 190 L390 190 L405 520 L95 520 Z",
};
const kindOf = (id: string) => (id === "sweat" ? "sweat" : id === "tote-bag" ? "tote" : "shirt");

export interface PreviewHandle { exportPng(pixelRatio?: number): string | null }

function useImg(src?: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return void setImg(null);
    const i = new window.Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);
  return img;
}

interface Props {
  productId: string;
  color: string;
  photo?: string;
  zone?: PrintZone | null;
  logo?: LogoPlacement;
  darkBg: boolean;
  showZone: boolean;
  zoom: number;
  onChange(next: LogoPlacement): void;
}

export const PreviewStage = forwardRef<PreviewHandle, Props>(function PreviewStage(
  { productId, color, photo, zone, logo, darkBg, showZone, zoom, onChange }, ref,
) {
  const stageRef = useRef<Konva.Stage>(null);
  const logoRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const photoLayer = useRef<Konva.Layer>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const img = useImg(logo?.dataUrl);
  const photoImg = useImg(photo);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el); setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (logoRef.current && trRef.current) { trRef.current.nodes([logoRef.current]); trRef.current.getLayer()?.batchDraw(); }
  }, [img, logo?.scale]);

  // Lissage haute qualité pour les réductions d'image (sinon le navigateur utilise un filtre basse qualité).
  useEffect(() => {
    const ctx = photoLayer.current?.getContext()._context as CanvasRenderingContext2D | undefined;
    if (ctx) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; photoLayer.current?.batchDraw(); }
  }, [photoImg, width, zoom]);

  const scale = (width / W) * zoom;
  const zx = zone ? (zone.x / 100) * W : 0, zy = zone ? (zone.y / 100) * H : 0;
  const zw = zone ? (zone.w / 100) * W : 0, zh = zone ? (zone.h / 100) * H : 0;
  const base = img && zone ? Math.min((zw * 0.7) / img.width, (zh * 0.7) / img.height) : 1;

  useImperativeHandle(ref, () => ({
    exportPng(pixelRatio = 3) {
      const s = stageRef.current; if (!s) return null;
      trRef.current?.visible(false);
      s.find(".guide").forEach((n) => n.visible(false));
      const url = s.toDataURL({ pixelRatio: pixelRatio / scale });
      trRef.current?.visible(true);
      s.find(".guide").forEach((n) => n.visible(showZone));
      return url;
    },
  }));

  const clamp = (cx: number, cy: number) => ({
    cx: Math.min(Math.max(cx, zx), zx + zw),
    cy: Math.min(Math.max(cy, zy), zy + zh),
  });

  const kind = kindOf(productId);
  const isCap = productId === "casquette";
  const outline = color.toLowerCase() === "#ffffff" ? "#d4d4d4" : "#000000";

  return (
    <div ref={wrapRef} className={`relative w-full overflow-hidden rounded-3xl border border-line ${darkBg ? "bg-ink" : "bg-mist"}`}
      style={{ aspectRatio: `${W}/${H}`, touchAction: "none" }}>
      <Stage ref={stageRef} pixelRatio={typeof window === "undefined" ? 1 : Math.max(window.devicePixelRatio || 1, 2)} width={width} height={(width * H) / W} scale={{ x: scale, y: scale }}
        offsetX={(W - W / zoom) / 2} offsetY={(H - H / zoom) / 2}>
        <Layer listening={false} ref={photoLayer}>
          {photo ? (
            photoImg && <KImage image={photoImg} x={0} y={0} width={W} height={H} listening={false} imageSmoothingEnabled
              shadowColor="#000000" shadowBlur={28} shadowOffsetY={14} shadowOpacity={darkBg ? 0 : 0.14} />
          ) : isCap ? (
            <Group>
              <Path data="M90 330 Q90 120 250 120 Q410 120 410 330 Z" fill={color} stroke={outline} strokeWidth={2} />
              <Ellipse x={250} y={335} radiusX={190} radiusY={45} fill={color} stroke={outline} strokeWidth={2} />
            </Group>
          ) : (
            <Group>
              {kind === "tote" && <Path data="M170 190 Q170 60 250 60 Q330 60 330 190" stroke={outline} strokeWidth={10} />}
              <Path data={SHAPES[kind]} fill={color} stroke={outline} strokeWidth={2} />
            </Group>
          )}
        </Layer>
        <Layer>
          {zone && (
            <Rect name="guide" visible={showZone} x={zx} y={zy} width={zw} height={zh}
              stroke={darkBg || color === "#111111" ? "#ffffff" : "#000000"} dash={[6, 6]} strokeWidth={1} opacity={0.5} listening={false} />
          )}
          {img && logo && zone && (
            <KImage ref={logoRef} image={img} draggable
              x={(logo.cx / 100) * W} y={(logo.cy / 100) * H}
              width={img.width * base * logo.scale} height={img.height * base * logo.scale}
              offsetX={(img.width * base * logo.scale) / 2} offsetY={(img.height * base * logo.scale) / 2}
              rotation={logo.rotation}
              onDragMove={(e) => { const c = clamp(e.target.x(), e.target.y()); e.target.position({ x: c.cx, y: c.cy }); }}
              onDragEnd={(e) => onChange({ ...logo, cx: (e.target.x() / W) * 100, cy: (e.target.y() / H) * 100 })}
              onTransformEnd={(e) => {
                const n = e.target; const s = n.scaleX();
                n.scale({ x: 1, y: 1 });
                onChange({ ...logo, scale: logo.scale * s, rotation: n.rotation(), cx: (n.x() / W) * 100, cy: (n.y() / H) * 100 });
              }} />
          )}
          <Transformer ref={trRef} keepRatio rotateEnabled enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
            anchorSize={18} borderStroke="#737373" anchorStroke="#000000" anchorFill="#ffffff" anchorCornerRadius={9} />
        </Layer>
      </Stage>
    </div>
  );
});
