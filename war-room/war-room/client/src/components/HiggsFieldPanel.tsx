import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Download, ImagePlus, Film } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const STUDEX_PROMPTS = [
  { label: "Wagyu Tomahawk hero shot", value: "Premium Wagyu Tomahawk steak on dark slate, golden hour lighting, steam rising, cinematic food photography, ultra sharp" },
  { label: "Braai lifestyle scene", value: "South African braai scene, Wagyu steaks on open fire grill, friends gathered, warm sunset, cinematic wide, smoke rising" },
  { label: "Wagyu Burger Patty close-up", value: "Premium Wagyu burger patties stacked, sesame bun, caramelised onions, dark moody background, golden bokeh, food commercial" },
  { label: "Biltong product shot", value: "Elite Marbled Wagyu Biltong in premium black-and-gold packaging, dark studio, luxury product photography" },
  { label: "Ankole Ribeye premium", value: "Ankole cattle ribeye on wooden board, herbs, rustic dark background, warm amber lighting, artisan butcher aesthetic" },
  { label: "Custom prompt", value: "" },
];

const ASPECT_OPTIONS = [
  { label: "Square 1:1 (Instagram)", value: "1024x1024" },
  { label: "Portrait 4:5 (Feed)", value: "896x1120" },
  { label: "Story 9:16 (Reels)", value: "768x1344" },
  { label: "Landscape 16:9 (YouTube)", value: "1344x768" },
];

interface GeneratedResult {
  type: "image" | "video";
  url: string;
  prompt: string;
}

export default function HiggsFieldPanel() {
  const [selectedPreset, setSelectedPreset] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("1024x1024");
  const [mode, setMode] = useState<"image" | "video">("image");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const { toast } = useToast();

  function handlePresetChange(val: string) {
    setSelectedPreset(val);
    const found = STUDEX_PROMPTS.find((p) => p.label === val);
    if (found && found.value) setPrompt(found.value);
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast({ title: "Enter a prompt first", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setResult(null);
    setApiKeyMissing(false);

    try {
      const body = { prompt: prompt.trim(), aspect, mode };
      const res = await apiRequest("POST", "/api/higgsfield/generate", body);
      const data = await res.json();

      if (data.error === "HIGGSFIELD_KEY_MISSING") {
        setApiKeyMissing(true);
        return;
      }

      if (data.url) {
        setResult({ type: mode, url: data.url, prompt });
        toast({ title: `${mode === "image" ? "Image" : "Video"} ready ✓` });
      } else {
        throw new Error(data.error || "No output URL");
      }
    } catch (err: any) {
      if (!apiKeyMissing) {
        toast({ title: "Generation failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-[#E8E0CC] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2
            className="text-xl font-semibold text-[#1A1410]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Higgsfield Studio
          </h2>
          <p className="text-xs text-[#6B5E45]">AI image & video generation — Soul, Veo, Kling, Seedance</p>
        </div>
        {/* Mode toggle */}
        <div className="ml-auto flex bg-[#F7F4EE] rounded-lg p-0.5 border border-[#E8E0CC]">
          <button
            onClick={() => setMode("image")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "image"
                ? "bg-white shadow-sm text-[#1A1410]"
                : "text-[#6B5E45] hover:text-[#1A1410]"
            }`}
            data-testid="button-mode-image"
          >
            <ImagePlus className="w-3.5 h-3.5" /> Image
          </button>
          <button
            onClick={() => setMode("video")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "video"
                ? "bg-white shadow-sm text-[#1A1410]"
                : "text-[#6B5E45] hover:text-[#1A1410]"
            }`}
            data-testid="button-mode-video"
          >
            <Film className="w-3.5 h-3.5" /> Video (I2V)
          </button>
        </div>
      </div>

      {/* API Key missing notice */}
      {apiKeyMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Higgsfield API key not configured</p>
          <p className="text-xs">Add your Higgsfield credentials to the server environment:</p>
          <code className="block mt-2 text-xs bg-amber-100 p-2 rounded font-mono">
            HIGGSFIELD_KEY_ID=your_key_id<br />
            HIGGSFIELD_KEY_SECRET=your_key_secret
          </code>
          <p className="text-xs mt-2">Get your API key at <a href="https://cloud.higgsfield.ai" target="_blank" rel="noopener noreferrer" className="underline">cloud.higgsfield.ai</a></p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Preset picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider">
            StudEx Preset
          </label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="bg-[#F7F4EE] border-[#E8E0CC]" data-testid="select-higgsfield-preset">
              <SelectValue placeholder="Choose a preset or write custom..." />
            </SelectTrigger>
            <SelectContent>
              {STUDEX_PROMPTS.map((p) => (
                <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aspect ratio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider">
            Aspect Ratio
          </label>
          <Select value={aspect} onValueChange={setAspect}>
            <SelectTrigger className="bg-[#F7F4EE] border-[#E8E0CC]" data-testid="select-higgsfield-aspect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_OPTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider">
          Prompt
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the content you want to generate... e.g. 'Premium Wagyu Tomahawk on dark slate, golden hour lighting, steam rising'"
          className="min-h-[90px] text-sm bg-[#F7F4EE] border-[#E8E0CC] resize-none"
          data-testid="textarea-higgsfield-prompt"
        />
        <p className="text-xs text-[#6B5E45]">
          {mode === "video"
            ? "Video mode: generates an image first, then animates it. Add motion cues: 'slow zoom', 'steam rising', 'fire crackling'."
            : "Tip: include 'cinematic', 'commercial food photography', 'dark slate background' for premium results."}
        </p>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="bg-purple-600 hover:bg-purple-700 text-white w-full h-10"
        data-testid="button-higgsfield-generate"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {mode === "image" ? "Generating image (30–60s)..." : "Generating video (60–120s)..."}
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Generate {mode === "image" ? "Image" : "Sizzle Reel"} with Higgsfield
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#1A1410] uppercase tracking-wider">
              Generated {result.type === "image" ? "Image" : "Video"}
            </p>
            <a
              href={result.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#B8943B] font-medium"
              data-testid="link-higgsfield-download"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
          <div className="rounded-xl overflow-hidden border border-[#E8E0CC] bg-[#F7F4EE]">
            {result.type === "image" ? (
              <img
                src={result.url}
                alt={result.prompt}
                className="w-full max-h-[480px] object-contain"
                data-testid="img-higgsfield-result"
              />
            ) : (
              <video
                src={result.url}
                controls
                autoPlay
                loop
                className="w-full max-h-[480px]"
                data-testid="video-higgsfield-result"
              />
            )}
          </div>
          <p className="text-xs text-[#6B5E45] italic line-clamp-2">"{result.prompt}"</p>
        </div>
      )}
    </section>
  );
}
