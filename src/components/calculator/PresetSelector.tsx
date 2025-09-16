import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { type Preset } from "@/lib/scoring";

interface PresetSelectorProps {
  presets: Preset[];
  activePreset: string;
  onPresetChange: (presetId: string) => void;
}

export function PresetSelector({ presets, activePreset, onPresetChange }: PresetSelectorProps) {
  const activePresetData = presets.find(p => p.id === activePreset);
  const displayName = activePreset === "custom" ? "Custom" : activePresetData?.name || "Custom";

  const handleReset = () => {
    onPresetChange("spec-default");
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activePreset} onValueChange={onPresetChange}>
        <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
          <SelectValue placeholder="Select preset">
            {displayName}
            {activePreset === "custom" && "*"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {presets.map((preset) => (
            <SelectItem
              key={preset.id}
              value={preset.id}
              className="text-white hover:bg-slate-700 focus:bg-slate-700"
            >
              <div className="space-y-1">
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-slate-400">{preset.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="border-slate-700 hover:bg-slate-700"
        title="Reset to Spec Default"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}