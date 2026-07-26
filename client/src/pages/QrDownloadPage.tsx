import React, { useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, ExternalLink, Palette, Type, Sliders, RefreshCw, Eye, Grid } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

// Synchronous High-Res QR Code DataURL Generator
const generateQrDataUrl = (
  url: string,
  fgColor: string,
  bgColor: string,
  eyeShape: 'square' | 'rounded' | 'circle',
  bodyShape: 'square' | 'dots' | 'rounded'
): string => {
  try {
    const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
    const size = qr.modules.size;
    if (!size) return '';

    const canvas = document.createElement('canvas');
    const canvasSize = 400; // 400x400 for crisp high-resolution print output
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const cellSize = canvasSize / size;

    // Step 1: Draw Body Modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip 3 Finder Pattern Eyes (7x7 in corners)
        const isTopLeftEye = r < 7 && c < 7;
        const isTopRightEye = r < 7 && c >= size - 7;
        const isBottomLeftEye = r >= size - 7 && c < 7;

        if (isTopLeftEye || isTopRightEye || isBottomLeftEye) continue;

        if (qr.modules.get(r, c) === 1) {
          ctx.fillStyle = fgColor;
          const x = c * cellSize;
          const y = r * cellSize;

          if (bodyShape === 'dots') {
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.42, 0, Math.PI * 2);
            ctx.fill();
          } else if (bodyShape === 'rounded') {
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, cellSize * 0.35);
            } else {
              ctx.rect(x, y, cellSize, cellSize);
            }
            ctx.fill();
          } else {
            ctx.fillRect(x, y, cellSize + 0.2, cellSize + 0.2);
          }
        }
      }
    }

    // Step 2: Draw 3 Corner Finder Eye Patterns
    const eyePositions = [
      { r: 0, c: 0 },
      { r: 0, c: size - 7 },
      { r: size - 7, c: 0 },
    ];

    eyePositions.forEach(({ r, c }) => {
      const eyeX = c * cellSize;
      const eyeY = r * cellSize;
      const eyeW = 7 * cellSize;

      ctx.fillStyle = bgColor;
      ctx.fillRect(eyeX, eyeY, eyeW, eyeW);

      const centerX = eyeX + eyeW / 2;
      const centerY = eyeY + eyeW / 2;

      if (eyeShape === 'circle') {
        // Outer Circle Ring
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, eyeW / 2, 0, Math.PI * 2);
        ctx.fill();

        // Gap Circle Ring
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, eyeW / 2 - cellSize, 0, Math.PI * 2);
        ctx.fill();

        // Center Circle Dot
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, eyeW / 2 - 2 * cellSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (eyeShape === 'rounded') {
        // Outer Rounded Box
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(eyeX, eyeY, eyeW, eyeW, 24);
        } else {
          ctx.rect(eyeX, eyeY, eyeW, eyeW);
        }
        ctx.fill();

        // Gap Rounded Box
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(eyeX + cellSize, eyeY + cellSize, eyeW - 2 * cellSize, eyeW - 2 * cellSize, 16);
        } else {
          ctx.rect(eyeX + cellSize, eyeY + cellSize, eyeW - 2 * cellSize, eyeW - 2 * cellSize);
        }
        ctx.fill();

        // Center Rounded Box
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, eyeW - 4 * cellSize, eyeW - 4 * cellSize, 10);
        } else {
          ctx.rect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, eyeW - 4 * cellSize, eyeW - 4 * cellSize);
        }
        ctx.fill();
      } else {
        // Standard Square Eye
        ctx.fillStyle = fgColor;
        ctx.fillRect(eyeX, eyeY, eyeW, eyeW);

        ctx.fillStyle = bgColor;
        ctx.fillRect(eyeX + cellSize, eyeY + cellSize, eyeW - 2 * cellSize, eyeW - 2 * cellSize);

        ctx.fillStyle = fgColor;
        ctx.fillRect(eyeX + 2 * cellSize, eyeY + 2 * cellSize, eyeW - 4 * cellSize, eyeW - 4 * cellSize);
      }
    });

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Error generating QR DataURL:', err);
    return '';
  }
};

export const QrDownloadPage: React.FC = () => {
  const { restaurant } = useAuthStore();
  const posterRef = useRef<HTMLDivElement>(null);

  // Dynamic origin detection (e.g. http://localhost:5173 or deployed domain)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const targetSlug = restaurant.slug || 'outlet';
  const dynamicQrUrl = `${currentOrigin}/r/${targetSlug}`;

  // Customization state
  const [frameColor, setFrameColor] = useState('#F97316');
  const [cardBgColor, setCardBgColor] = useState('#FFFFFF');
  const [titleColor, setTitleColor] = useState('#334155');
  const [qrFgColor, setQrFgColor] = useState('#334155');
  const [qrBgColor, setQrBgColor] = useState('#FFFDF8');
  const [frameStyle, setFrameStyle] = useState<'solid' | 'double' | 'glow' | 'dark'>('solid');

  // Internal QR Pattern Customizations
  const [eyeStyle, setEyeStyle] = useState<'square' | 'rounded' | 'circle'>('square');
  const [bodyStyle, setBodyStyle] = useState<'square' | 'dots' | 'rounded'>('square');

  const [headerText, setHeaderText] = useState('SCAN TO ORDER FOOD');
  const [instructionText, setInstructionText] = useState(
    '1. Open Phone Camera → 2. Scan QR → 3. Browse Digital Menu & Place Order'
  );

  // Generate QR Data URL synchronously in memory
  const qrDataUrl = useMemo(() => {
    return generateQrDataUrl(dynamicQrUrl, qrFgColor, qrBgColor, eyeStyle, bodyStyle);
  }, [dynamicQrUrl, qrFgColor, qrBgColor, eyeStyle, bodyStyle]);

  const handleResetCustomization = () => {
    setFrameColor('#F97316');
    setCardBgColor('#FFFFFF');
    setTitleColor('#334155');
    setQrFgColor('#334155');
    setQrBgColor('#FFFDF8');
    setFrameStyle('solid');
    setEyeStyle('square');
    setBodyStyle('square');
    setHeaderText('SCAN TO ORDER FOOD');
    setInstructionText('1. Open Phone Camera → 2. Scan QR → 3. Browse Digital Menu & Place Order');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-[#334155]">Printable QR Code Poster & Customizer</h2>
          <p className="text-xs text-[#6B7280]">
            Customize colors, corner eye patterns, body dot styles, and text before printing your high-res poster standee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCustomization}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Design
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Printer className="w-4 h-4 text-white" />}
            onClick={() => window.print()}
          >
            Print Poster
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Printable Poster Standee Preview Frame (6 Cols) */}
        <div className="lg:col-span-6 flex justify-center sticky top-6">
          <div
            id="printable-qr-poster"
            ref={posterRef}
            style={{
              borderColor: frameStyle === 'dark' ? '#334155' : frameColor,
              backgroundColor: frameStyle === 'dark' ? '#0F172A' : cardBgColor,
              color: frameStyle === 'dark' ? '#FFFFFF' : titleColor,
              boxShadow: frameStyle === 'glow' ? `0 0 35px ${frameColor}55` : '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            className={`w-full max-w-md text-center relative overflow-hidden transition-all duration-300 ${
              frameStyle === 'double'
                ? 'border-8 border-double rounded-3xl'
                : 'border-4 rounded-3xl'
            }`}
          >
            {/* Top Decorative Header */}
            <div
              style={{ backgroundColor: frameColor, color: '#FFFFFF' }}
              className="w-full py-3.5 px-6 font-heading font-extrabold text-xs uppercase tracking-widest"
            >
              {headerText || 'SCAN TO ORDER FOOD'}
            </div>

            {/* Content Container Body */}
            <div style={{ backgroundColor: frameStyle === 'dark' ? '#0F172A' : cardBgColor }} className="p-8 pt-4 space-y-6">
              {/* Restaurant Profile */}
              <div className="space-y-1">
                <h3
                  style={{ color: frameStyle === 'dark' ? '#FFFFFF' : titleColor }}
                  className="font-heading font-extrabold text-2xl"
                >
                  {restaurant.name}
                </h3>
                <p
                  style={{ color: frameStyle === 'dark' ? '#94A3B8' : '#6B7280' }}
                  className="text-xs font-medium"
                >
                  {restaurant.tagline}
                </p>
              </div>

              {/* QR Code Graphic Container */}
              <div
                style={{ backgroundColor: qrBgColor, borderColor: `${frameColor}40` }}
                className="p-6 rounded-2xl border-2 shadow-inner inline-flex flex-col items-center justify-center mx-auto"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Custom QR Code"
                    className="w-[200px] h-[200px] block rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded-lg" />
                )}
              </div>

              {/* Instruction Banner */}
              <div className="space-y-2 pt-2">
                <p
                  style={{ color: frameStyle === 'dark' ? '#94A3B8' : '#6B7280' }}
                  className="text-xs leading-relaxed max-w-xs mx-auto font-medium"
                >
                  {instructionText}
                </p>
              </div>

              {/* Mandatory Platform Branding Footer */}
              <div
                style={{
                  borderTop: `1px solid ${frameStyle === 'dark' ? '#334155' : '#E2E8F0'}`,
                  color: frameStyle === 'dark' ? '#FFFFFF' : titleColor,
                }}
                className="pt-4 text-[10px] font-bold tracking-wider uppercase"
              >
                Powered by QRasoi Digital Menus
              </div>
            </div>
          </div>
        </div>

        {/* Customization Control Panel (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Frame & Eye Pattern Customizer */}
          <Card className="p-6 space-y-5">
            <h3 className="font-heading font-bold text-base text-[#334155] flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#F97316]" />
              <span>Frame & QR Pattern Customizer</span>
            </h3>

            {/* Frame Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-500" /> Standee Outer Frame Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'solid', label: 'Modern Solid' },
                  { id: 'double', label: 'Double Border' },
                  { id: 'glow', label: 'Neon Glow' },
                  { id: 'dark', label: 'Minimal Dark' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFrameStyle(s.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      frameStyle === s.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Corner Eye Shape Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" /> QR Corner Eye Style (3 Finder Eyes)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'square', label: 'Square (Classic)' },
                  { id: 'rounded', label: 'Smooth Rounded' },
                  { id: 'circle', label: 'Circular Eye' },
                ].map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEyeStyle(e.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      eyeStyle === e.id
                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Body Pattern Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-blue-500" /> QR Body Module Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'square', label: 'Classic Square' },
                  { id: 'rounded', label: 'Soft Rounded' },
                  { id: 'dots', label: 'Circular Dots' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBodyStyle(b.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      bodyStyle === b.id
                        ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-500" /> Card & QR Color Controls
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Frame Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{frameColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Card Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={cardBgColor}
                      onChange={(e) => setCardBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{cardBgColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Title Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={titleColor}
                      onChange={(e) => setTitleColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{titleColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">QR Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{qrFgColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">QR Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{qrBgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Text Customizer */}
          <Card className="p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-[#334155] flex items-center gap-2">
              <Type className="w-5 h-5 text-amber-500" />
              <span>Poster Text Customizer</span>
            </h3>

            <Input
              label="Header Banner Text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="e.g. SCAN TO ORDER FOOD"
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Instruction Steps</label>
              <textarea
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500"
              />
            </div>
          </Card>

          {/* QR Specs Box */}
          <Card className="p-5 space-y-3 text-xs text-slate-600 bg-slate-50 border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5 text-orange-500" /> Live QR Destination
            </h4>
            <p className="font-mono text-[11px] text-orange-600 break-all bg-white p-2 rounded-lg border border-slate-200">
              {dynamicQrUrl}
            </p>
            <p className="text-[11px] text-slate-500">
              Click <strong>Print Poster</strong> to save directly as a PDF or print high-res table standees for your restaurant.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
