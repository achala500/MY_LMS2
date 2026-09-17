'use client';

import React, { useState, useEffect } from 'react';
import {
  ScholarCustomAvatar,
  ScholarAvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  renderAvatarToCanvas,
} from './ScholarCustomAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Palette, Shuffle, Check, Heart } from 'lucide-react';
import { fireConfetti } from '@/lib/confetti';
import { safeStorage } from '@/lib/storage/safeStorage';

interface ScholarAvatarStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: ScholarAvatarConfig) => void;
}

export const ScholarAvatarStudioModal: React.FC<ScholarAvatarStudioModalProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [config, setConfig] = useState<ScholarAvatarConfig>(DEFAULT_AVATAR_CONFIG);

  // Load stored avatar on mount
  useEffect(() => {
    const saved = safeStorage.getJson<any>('studysync_scholar_avatar', null);
    if (saved) {
      setConfig({ ...DEFAULT_AVATAR_CONFIG, ...saved });
    }
  }, [open]);

  const handleRandomize = () => {
    const skinTones: ScholarAvatarConfig['skinTone'][] = ['fair', 'warm', 'golden', 'bronze', 'mocha', 'espresso'];
    const hairStyles: ScholarAvatarConfig['hairStyle'][] = ['swoop', 'ponytail', 'curly', 'bun', 'crop', 'wavy', 'dreads', 'buzz'];
    const expressions: ScholarAvatarConfig['expression'][] = ['focus', 'smile', 'determined', 'wink', 'calm', 'studious'];
    const glassesList: ScholarAvatarConfig['glasses'][] = ['round', 'square', 'cateye', 'none'];
    const outfits: ScholarAvatarConfig['outfit'][] = ['hoodie', 'blazer', 'cardigan', 'tee', 'jacket', 'polo'];
    const colors: ScholarAvatarConfig['outfitColor'][] = ['salmon', 'yellow', 'orange', 'navy', 'emerald', 'lavender', 'sky', 'rust'];
    const accessories: ScholarAvatarConfig['accessory'][] = ['headphones', 'pencil', 'mortarboard', 'beanie', 'none'];
    const badges: ScholarAvatarConfig['badgeProp'][] = ['flame', 'tea', 'star', 'book', 'none'];
    const halos: ScholarAvatarConfig['haloStyle'][] = ['paper', 'sunrise', 'emerald', 'slate'];

    setConfig({
      ...config,
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      expression: expressions[Math.floor(Math.random() * expressions.length)],
      glasses: glassesList[Math.floor(Math.random() * glassesList.length)],
      outfit: outfits[Math.floor(Math.random() * outfits.length)],
      outfitColor: colors[Math.floor(Math.random() * colors.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)],
      badgeProp: badges[Math.floor(Math.random() * badges.length)],
      haloStyle: halos[Math.floor(Math.random() * halos.length)],
    });
  };

  const handleSave = () => {
    try {
      safeStorage.setJson('studysync_scholar_avatar', config);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studysync_avatar_updated', { detail: config }));
      }
      if (onSave) onSave(config);
      fireConfetti();
      toast.success('Your custom study avatar has been saved!');
      onOpenChange(false);
    } catch (e) {
      toast.error('Failed to save avatar');
    }
  };

  const handleDownloadPng = () => {
    try {
      const canvas = document.createElement('canvas');
      renderAvatarToCanvas({ ...config, size: 512 }, canvas, 1);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `studysync_avatar_${Date.now()}.png`;
      a.click();
      toast.success('Avatar downloaded as high-res PNG!');
    } catch (err) {
      toast.error('Failed to export avatar image');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#ffffff] border border-[#e7e1de] text-[#1d1b19] p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[92vh]">
        <DialogHeader className="pb-4 border-b border-[#f3ede9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ffdcbc] flex items-center justify-center text-[#854f00]">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="font-serif text-xl font-bold text-[#1d1b19]">
                  Student Avatar Studio
                </DialogTitle>
                <DialogDescription className="text-xs text-[#2d2420]">
                  Design your personalized study companion avatar (100% Canvas 2D, zero SVGs).
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomize}
              className="border-[#e7e1de] text-[#1d1b19] rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Surprise Me</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 items-start">
          {/* Left Column: Live Interactive Character Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#fef8f4] border border-[#e7e1de] text-center space-y-3 sticky top-4">
            <ScholarCustomAvatar config={config} size={180} />
            <div>
              <span className="font-serif font-bold text-sm text-[#1d1b19]">Live Focus Look</span>
              <p className="font-sans text-[11px] text-[#2d2420] mt-0.5">
                Renders at your Focus Town desk, student pass, and ledger.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPng}
              className="border-[#dec0b7] bg-white hover:bg-[#f8f2ef] text-[#1d1b19] rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span>Download PNG Image</span>
            </Button>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 space-y-4 text-xs">
            {/* Skin Tone */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Skin Complexion
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  { id: 'fair', label: 'Fair', bg: '#ffe0bd' },
                  { id: 'warm', label: 'Warm', bg: '#ffd1b3' },
                  { id: 'golden', label: 'Golden', bg: '#f1c27d' },
                  { id: 'bronze', label: 'Bronze', bg: '#c68642' },
                  { id: 'mocha', label: 'Mocha', bg: '#8d5524' },
                  { id: 'espresso', label: 'Espresso', bg: '#583a22' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, skinTone: item.id as any })}
                    style={{ backgroundColor: item.bg }}
                    className={`h-8 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold ${
                      (config.skinTone || 'warm') === item.id
                        ? 'border-[#19202e] scale-105 shadow-xs'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={item.label}
                  />
                ))}
              </div>
            </div>

            {/* Expression */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Facial Expression
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'focus', label: '🎯 Focus' },
                  { id: 'smile', label: '😊 Smile' },
                  { id: 'determined', label: '💪 Determined' },
                  { id: 'wink', label: '😉 Wink' },
                  { id: 'calm', label: '😌 Calm Zen' },
                  { id: 'studious', label: '🧐 Studious' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, expression: item.id as any })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      config.expression === item.id
                        ? 'bg-[#19202e] text-white border-[#19202e] font-semibold'
                        : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#2d2420] border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Hairstyle
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'swoop', label: 'Classic' },
                  { id: 'ponytail', label: 'Ponytail' },
                  { id: 'curly', label: 'Curly Afro' },
                  { id: 'bun', label: 'Top Bun' },
                  { id: 'crop', label: 'Short Crop' },
                  { id: 'wavy', label: 'Wavy' },
                  { id: 'dreads', label: 'Dreads' },
                  { id: 'buzz', label: 'Buzz Fade' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, hairStyle: item.id as any })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      config.hairStyle === item.id
                        ? 'bg-[#19202e] text-white border-[#19202e] font-semibold'
                        : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#2d2420] border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color Swatches */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Hair Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { hex: '#19202e', name: 'Jet Black' },
                  { hex: '#3a271d', name: 'Dark Espresso' },
                  { hex: '#6b4423', name: 'Chestnut' },
                  { hex: '#b46736', name: 'Warm Copper' },
                  { hex: '#d4a373', name: 'Caramel' },
                  { hex: '#94a3b8', name: 'Silver Ash' },
                  { hex: '#fa7268', name: 'Pastel Coral' },
                  { hex: '#456644', name: 'Forest Tint' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setConfig({ ...config, hairColor: c.hex })}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      config.hairColor === c.hex ? 'scale-125 border-black shadow-xs' : 'border-transparent'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Glasses */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Study Eyewear
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'round', label: 'Round Wire' },
                  { id: 'square', label: 'Intellectual' },
                  { id: 'cateye', label: 'Cat-Eye' },
                  { id: 'none', label: 'None' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, glasses: item.id as any })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      config.glasses === item.id
                        ? 'bg-[#19202e] text-white border-[#19202e] font-semibold'
                        : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#2d2420] border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Outfit Style & Color */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Outfit &amp; Palette
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { id: 'hoodie', label: 'Cozy Hoodie' },
                  { id: 'blazer', label: 'School Blazer' },
                  { id: 'cardigan', label: 'Cardigan' },
                  { id: 'tee', label: 'Casual Tee' },
                  { id: 'jacket', label: 'Varsity Jacket' },
                  { id: 'polo', label: 'Study Polo' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, outfit: item.id as any })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      config.outfit === item.id
                        ? 'bg-[#19202e] text-white border-[#19202e] font-semibold'
                        : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#2d2420] border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Outfit Color Swatches */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'salmon', bg: '#fa7268', name: 'Salmon Coral' },
                  { id: 'yellow', bg: '#fcd34d', name: 'Muted Yellow' },
                  { id: 'orange', bg: '#fb923c', name: 'Warm Orange' },
                  { id: 'navy', bg: '#19202e', name: 'Midnight Navy' },
                  { id: 'emerald', bg: '#456644', name: 'Forest Emerald' },
                  { id: 'lavender', bg: '#a78bfa', name: 'Lavender' },
                  { id: 'sky', bg: '#38bdf8', name: 'Sky Blue' },
                  { id: 'rust', bg: '#c85a32', name: 'Terracotta' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setConfig({ ...config, outfitColor: c.id as any })}
                    style={{ backgroundColor: c.bg }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      config.outfitColor === c.id ? 'scale-125 border-black shadow-xs' : 'border-transparent'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Accessories & Headgear */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Headgear &amp; Accessories
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'headphones', label: '🎧 ANC Cups' },
                  { id: 'pencil', label: '✏️ Pencil' },
                  { id: 'mortarboard', label: '🎓 Cap' },
                  { id: 'beanie', label: '🧢 Beanie' },
                  { id: 'none', label: 'None' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, accessory: item.id as any })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      config.accessory === item.id
                        ? 'bg-[#19202e] text-white border-[#19202e] font-semibold'
                        : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#2d2420] border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Study Badge / Desk Prop */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#2d2420] mb-1.5">
                Study Badge Prop
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'flame', label: '🔥 Flame Streak' },
                  { id: 'tea', label: '☕ Ceylon Tea' },
                  { id: 'star', label: '⭐ Top Ranker' },
                  { id: 'book', label: '📖 Past Paper' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, badgeProp: item.id as any })}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      (config.badgeProp || 'flame') === item.id
                        ? 'bg-[#19202e] text-white border-[#19202e] font-semibold'
                        : 'bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#2d2420] border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-[#f3ede9] flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#e7e1de] text-[#1d1b19] rounded-full text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#c85a32] hover:bg-[#b04b25] text-white font-semibold text-xs rounded-full flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Apply Avatar</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
