import React, { useState, useRef } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  RotateCcw,
} from 'lucide-react';

export const ResizableImageComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
  editor,
  getPos,
}) => {
  const { src, alt, title, width, height, alignment = 'center' } = node.attrs;

  const [isResizing, setIsResizing] = useState(false);
  const [dragSize, setDragSize] = useState<{ width: number; height: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(1.5);
  const [isHovered, setIsHovered] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived current dimensions (prefer active drag size while resizing, else node attributes)
  const currentWidth = isResizing && dragSize ? dragSize.width : (width ? Number(width) : null);
  const currentHeight = isResizing && dragSize ? dragSize.height : (height ? Number(height) : null);

  // Handle image load to capture aspect ratio
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(ratio);
      if (!width) {
        const parentW = containerRef.current?.parentElement?.clientWidth || 650;
        const initialW = Math.min(img.naturalWidth, parentW);
        const initialH = Math.round(initialW / ratio);
        updateAttributes({ width: initialW, height: initialH });
      }
    }
  };

  // Get cursor style based on handle direction
  const getCursor = (handle: string) => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 's':
        return 'ns-resize';
      default:
        return 'crosshair';
    }
  };

  // Corner/edge resize dragging handler
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = imgRef.current?.clientWidth || currentWidth || 320;
    const startHeight = imgRef.current?.clientHeight || currentHeight || 200;
    const ratio = startHeight > 0 ? startWidth / startHeight : aspectRatio || 1.5;

    setIsResizing(true);
    document.body.style.cursor = getCursor(handle);
    document.body.style.userSelect = 'none';

    let latestW = startWidth;
    let latestH = startHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newW = startWidth;
      let newH = startHeight;

      if (handle === 'se') {
        newW = startWidth + deltaX;
        newH = Math.round(newW / ratio);
      } else if (handle === 'sw') {
        newW = startWidth - deltaX;
        newH = Math.round(newW / ratio);
      } else if (handle === 'ne') {
        newW = startWidth + deltaX;
        newH = Math.round(newW / ratio);
      } else if (handle === 'nw') {
        newW = startWidth - deltaX;
        newH = Math.round(newW / ratio);
      } else if (handle === 'e') {
        newW = startWidth + deltaX;
        newH = startHeight;
      } else if (handle === 'w') {
        newW = startWidth - deltaX;
        newH = startHeight;
      } else if (handle === 's') {
        newH = startHeight + deltaY;
        newW = Math.round(newH * ratio);
      }

      // Constraints
      const parentW = containerRef.current?.parentElement?.clientWidth || 800;
      newW = Math.max(70, Math.min(parentW, Math.round(newW)));
      newH = Math.max(40, Math.round(newH));

      latestW = newW;
      latestH = newH;
      setDragSize({ width: newW, height: newH });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsResizing(false);
      setDragSize(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      updateAttributes({
        width: latestW,
        height: latestH,
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Select node in editor on click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        editor.commands.setNodeSelection(pos);
      }
    }
  };

  // Alignment classes for container
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      case 'center':
      default:
        return 'justify-center';
    }
  };

  // Quick resize presets
  const handlePresetWidth = (percentage: number) => {
    const parentW = containerRef.current?.parentElement?.clientWidth || 700;
    const targetW = Math.round(parentW * percentage);
    const targetH = Math.round(targetW / aspectRatio);
    updateAttributes({ width: targetW, height: targetH });
  };

  // Reset to natural dimensions
  const handleResetSize = () => {
    if (imgRef.current?.naturalWidth && imgRef.current?.naturalHeight) {
      const natW = imgRef.current.naturalWidth;
      const natH = imgRef.current.naturalHeight;
      updateAttributes({ width: natW, height: natH });
    }
  };

  const isInteractive = selected || isHovered || isResizing;

  // Convert px to cm (37.8 px per cm at 96 DPI)
  const widthCm = currentWidth ? (currentWidth / 37.795).toFixed(1) : null;
  const heightCm = currentHeight ? (currentHeight / 37.795).toFixed(1) : null;

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`my-3 w-full flex ${getAlignmentClass()} select-none`}
      data-drag-handle
    >
      <div
        className="relative inline-block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        style={{ width: currentWidth ? `${currentWidth}px` : 'auto' }}
      >
        {/* Floating Toolbar when selected/hovered */}
        {isInteractive && (
          <div
            className="no-print absolute -top-11 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-lg rounded-xl px-2 py-1 flex items-center gap-1 text-slate-700 animate-in fade-in duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Alignment buttons */}
            <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => updateAttributes({ alignment: 'left' })}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  alignment === 'left' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                }`}
                title="Zarovnat vlevo"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateAttributes({ alignment: 'center' })}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  alignment === 'center' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                }`}
                title="Zarovnat na střed"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateAttributes({ alignment: 'right' })}
                className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                  alignment === 'right' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                }`}
                title="Zarovnat vpravo"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Size Presets */}
            <div className="flex items-center gap-1 text-[10px] font-medium border-r border-slate-200 pr-1.5 mr-0.5">
              <button
                type="button"
                onClick={() => handlePresetWidth(0.25)}
                className="px-1.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                title="Šířka 25%"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handlePresetWidth(0.5)}
                className="px-1.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                title="Šířka 50%"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handlePresetWidth(0.75)}
                className="px-1.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                title="Šířka 75%"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handlePresetWidth(1.0)}
                className="px-1.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                title="Plná šířka (100%)"
              >
                100%
              </button>
              <button
                type="button"
                onClick={handleResetSize}
                className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                title="Obnovit původní velikost"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Live Size Badge */}
            {currentWidth && (
              <span className="text-[10px] font-mono text-slate-500 px-1 border-r border-slate-200 pr-1.5 mr-0.5">
                {currentWidth}×{currentHeight || '?'}px ({widthCm} cm)
              </span>
            )}

            {/* Delete button */}
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
              title="Smazat objekt"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dimension Tooltip when actively resizing */}
        {isResizing && currentWidth && (
          <div className="no-print absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-[11px] font-mono px-2.5 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap">
            {currentWidth} × {currentHeight} px ({widthCm} × {heightCm} cm)
          </div>
        )}

        {/* The Image Itself */}
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          onLoad={handleImageLoad}
          style={{
            width: currentWidth ? `${currentWidth}px` : 'auto',
            height: currentHeight ? `${currentHeight}px` : 'auto',
            maxWidth: '100%',
          }}
          className={`block rounded transition-shadow ${
            isInteractive
              ? 'ring-2 ring-blue-500/80 shadow-md ring-offset-1'
              : 'hover:ring-1 hover:ring-blue-300'
          }`}
          draggable={false}
        />

        {/* 4 Corner Handles (Classic text editors) */}
        {isInteractive && (
          <>
            {/* Top-Left */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              className="no-print absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs cursor-nwse-resize z-30 hover:scale-125 transition-transform"
              title="Změnit velikost rohem"
            />
            {/* Top-Right */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              className="no-print absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs cursor-nesw-resize z-30 hover:scale-125 transition-transform"
              title="Změnit velikost rohem"
            />
            {/* Bottom-Right */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              className="no-print absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs cursor-nwse-resize z-30 hover:scale-125 transition-transform"
              title="Změnit velikost rohem"
            />
            {/* Bottom-Left */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              className="no-print absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs cursor-nesw-resize z-30 hover:scale-125 transition-transform"
              title="Změnit velikost rohem"
            />

            {/* Edge Handles */}
            {/* Left Edge */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'w')}
              className="no-print absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-3.5 bg-white border-2 border-blue-600 rounded-xs shadow-xs cursor-ew-resize z-30 hover:scale-125 transition-transform"
              title="Změnit šířku zleva"
            />
            {/* Right Edge */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'e')}
              className="no-print absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-3.5 bg-white border-2 border-blue-600 rounded-xs shadow-xs cursor-ew-resize z-30 hover:scale-125 transition-transform"
              title="Změnit šířku zprava"
            />
            {/* Bottom Edge */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 's')}
              className="no-print absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-2.5 bg-white border-2 border-blue-600 rounded-xs shadow-xs cursor-ns-resize z-30 hover:scale-125 transition-transform"
              title="Změnit výšku zdola"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
