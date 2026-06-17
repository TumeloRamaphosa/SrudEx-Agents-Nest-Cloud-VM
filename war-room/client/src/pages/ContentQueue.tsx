import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { ContentItem } from "@shared/schema";
import {
  Check, X, Send, Eye, Instagram, Facebook,
  Clock, Loader2, CheckCircle2
} from "lucide-react";

// Asset imports
import tomahawkHero from "@assets/tomahawk-hero.jpg";
import hwendeBox from "@assets/hwende-box.png";
import braaiLifestyle from "@assets/braai-lifestyle.png";
import youthDay from "@assets/youth-day.png";
import wagyuPatties from "@assets/wagyu-patties.png";
import hwendeCelebration from "@assets/hwende-celebration.png";
import ankoleScarcity from "@assets/ankole-scarcity.png";

const assetMap: Record<string, string> = {
  "/assets/tomahawk-hero.jpg": tomahawkHero,
  "/assets/hwende-box.png": hwendeBox,
  "/assets/braai-lifestyle.png": braaiLifestyle,
  "/assets/youth-day.png": youthDay,
  "/assets/wagyu-patties.png": wagyuPatties,
  "/assets/hwende-celebration.png": hwendeCelebration,
  "/assets/ankole-scarcity.png": ankoleScarcity,
};

function getAsset(path: string) {
  return assetMap[path] || path;
}

const FILTERS = ["All", "Draft", "Approved", "Posted", "Rejected", "Fathers Day", "Hwende", "Youth Day", "Product Spotlight"];

// War Room color constants
const GOLD = "#C9A84C";
const GOLD_DIM = "#9a8a5a";
const GOLD_DARK = "#5a4f2e";
const CREAM = "#f5ecd0";
const GREEN = "#6fa84f";
const RED = "#c14e3c";
const OBSIDIAN_2 = "#15140e";

interface LightboxProps {
  item: ContentItem;
  onClose: () => void;
}

function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function InstagramLightbox({ item, onClose }: LightboxProps) {
  const isStory = item.type === "video";
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden" style={{ background: "#000", border: `1px solid ${GOLD}` }} data-testid="lightbox-modal">
        <div className="relative w-full" style={{ background: "#111", aspectRatio: isStory ? "9/16" : "1/1" }}>
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-3 py-2" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">studexmeat</p>
              <p className="text-[10px]" style={{ color: GOLD_DIM }}>Sponsored</p>
            </div>
            <X className="ml-auto w-4 h-4 text-white cursor-pointer" onClick={onClose} />
          </div>
          <img
            src={getAsset(item.assetPath)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
            <p className="text-white text-xs leading-relaxed line-clamp-3">{item.caption}</p>
            <p className="text-[10px] mt-1" style={{ color: GOLD }}>{item.hashtags.split(" ").slice(0, 5).join(" ")}</p>
          </div>
          <div className="absolute right-3 bottom-16 flex flex-col items-center gap-3">
            <Heart className="w-6 h-6 text-white" />
            <MessageCircle className="w-6 h-6 text-white" />
            <Send className="w-6 h-6 text-white" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WRLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase", color: GOLD, fontFamily: "'Helvetica Neue', sans-serif" }}>
      {children}
    </span>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  const statusMutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      apiRequest("PATCH", `/api/content/${item.id}/status`, { status, note }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
    onError: () => toast({ title: "Error updating status", variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", `/api/content/${item.id}/post`, {}).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({ title: "Posted ✅", description: "Content queued for posting" });
    },
    onError: () => toast({ title: "Error posting", variant: "destructive" }),
  });

  const isApproved = item.status === "approved";
  const isRejected = item.status === "rejected";
  const isPosted = item.status === "posted";

  const cardBorderColor = isApproved
    ? "rgba(111,168,79,0.5)"
    : isRejected
    ? "rgba(193,78,60,0.4)"
    : isPosted
    ? "rgba(201,168,76,0.4)"
    : "rgba(201,168,76,0.25)";

  const scheduledStr = item.scheduledDate
    ? new Date(item.scheduledDate).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()
    : "UNSCHEDULED";

  const scheduledTime = item.scheduledDate
    ? new Date(item.scheduledDate).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";

  const platformLabel =
    item.platform === "both" ? "IG + FB" :
    item.platform === "instagram" ? "INSTAGRAM" :
    item.platform === "facebook" ? "FACEBOOK" : item.platform?.toUpperCase() ?? "SOCIAL";

  return (
    <>
      <div
        className="relative flex flex-col transition-all duration-200"
        style={{
          background: OBSIDIAN_2,
          border: `1px solid ${cardBorderColor}`,
          opacity: isRejected ? 0.55 : 1,
        }}
        data-testid={`card-content-${item.id}`}
      >
        {/* Status badge — absolute top-right */}
        {isApproved && (
          <div
            className="absolute z-10"
            style={{
              top: "12px",
              right: "12px",
              fontSize: "9px",
              letterSpacing: "3px",
              color: GREEN,
              padding: "4px 8px",
              border: `1px solid ${GREEN}`,
              background: "rgba(0,0,0,0.5)",
              fontFamily: "'Helvetica Neue', sans-serif",
              textTransform: "uppercase",
            }}
          >
            APPROVED
          </div>
        )}
        {isRejected && (
          <div
            className="absolute z-10"
            style={{
              top: "12px",
              right: "12px",
              fontSize: "9px",
              letterSpacing: "3px",
              color: RED,
              padding: "4px 8px",
              border: `1px solid ${RED}`,
              background: "rgba(0,0,0,0.5)",
              fontFamily: "'Helvetica Neue', sans-serif",
              textTransform: "uppercase",
            }}
          >
            REJECTED
          </div>
        )}
        {isPosted && (
          <div
            className="absolute z-10"
            style={{
              top: "12px",
              right: "12px",
              fontSize: "9px",
              letterSpacing: "3px",
              color: GOLD,
              padding: "4px 8px",
              border: `1px solid ${GOLD}`,
              background: "rgba(0,0,0,0.5)",
              fontFamily: "'Helvetica Neue', sans-serif",
              textTransform: "uppercase",
            }}
          >
            POSTED
          </div>
        )}

        {/* Card header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(201,168,76,0.15)",
            background: "linear-gradient(180deg, rgba(21,20,14,0.8) 0%, rgba(21,20,14,0) 100%)",
          }}
        >
          {/* Slot meta */}
          <div
            className="flex gap-5 mb-3"
            style={{
              fontSize: "10px",
              letterSpacing: "3px",
              color: GOLD_DIM,
              textTransform: "uppercase",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            <span>{platformLabel}</span>
            {scheduledTime && <span style={{ color: GOLD }}>{scheduledTime}</span>}
            <span>{scheduledStr}</span>
            {item.campaign && <span style={{ color: GOLD_DIM }}>{item.campaign.toUpperCase()}</span>}
          </div>
          {/* Hook / title */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "24px",
              color: CREAM,
              lineHeight: 1.25,
              paddingRight: isApproved || isRejected || isPosted ? "100px" : "0",
            }}
          >
            {item.title}
          </h2>
        </div>

        {/* Card body — two columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
          }}
          className="flex-1 flex-wrap"
        >
          {/* Left: caption */}
          <div style={{ padding: "20px 24px" }}>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <WRLabel>Caption</WRLabel>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${GOLD_DARK}`,
                    color: GOLD_DIM,
                    padding: "3px 8px",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "'Helvetica Neue', sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  {editMode ? "Done" : "Edit"}
                </button>
              </div>
              {editMode ? (
                <textarea
                  defaultValue={item.caption}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.5)",
                    border: `1px solid ${GOLD_DARK}`,
                    color: CREAM,
                    padding: "10px",
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontSize: "13px",
                    lineHeight: 1.55,
                    resize: "vertical",
                    minHeight: "100px",
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: "13px",
                    color: CREAM,
                    lineHeight: 1.55,
                    background: "rgba(0,0,0,0.3)",
                    padding: "12px",
                    borderLeft: `2px solid ${GOLD_DARK}`,
                    fontFamily: "'Helvetica Neue', sans-serif",
                    maxHeight: "120px",
                    overflowY: "auto",
                  }}
                >
                  {item.caption}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2">
                <WRLabel>Hashtags</WRLabel>
              </div>
              <p
                style={{
                  fontFamily: "'Menlo', 'Monaco', monospace",
                  fontSize: "11px",
                  color: GOLD_DIM,
                  background: "rgba(0,0,0,0.4)",
                  padding: "10px",
                  borderLeft: `2px solid ${GOLD_DARK}`,
                  wordBreak: "break-word",
                  lineHeight: 1.6,
                }}
              >
                {item.hashtags}
              </p>
            </div>
          </div>

          {/* Right: image */}
          <div
            style={{
              padding: "20px 24px",
              borderLeft: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            <div className="mb-2">
              <WRLabel>Visual</WRLabel>
            </div>
            <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", background: "#000" }}>
              <img
                src={getAsset(item.assetPath)}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              {/* Platform icons */}
              <div className="absolute bottom-2 left-2 flex gap-1">
                {(item.platform === "facebook" || item.platform === "both") && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <Facebook className="w-3 h-3 text-white" />
                  </div>
                )}
                {(item.platform === "instagram" || item.platform === "both") && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
                  >
                    <Instagram className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              {/* Preview hover button */}
              <button
                onClick={() => setShowLightbox(true)}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.35)" }}
                data-testid={`button-preview-${item.id}`}
              >
                <div className="rounded-full p-2" style={{ background: "rgba(201,168,76,0.15)", border: `1px solid ${GOLD}` }}>
                  <Eye className="w-4 h-4" style={{ color: GOLD }} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div
          className="flex items-center gap-2 flex-wrap"
          style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          {item.status !== "posted" && item.status !== "approved" && item.status !== "rejected" && (
            <button
              onClick={() => statusMutation.mutate({ status: "approved" })}
              disabled={statusMutation.isPending}
              style={{
                background: "transparent",
                border: `1px solid rgba(111,168,79,0.5)`,
                color: GREEN,
                padding: "9px 16px",
                fontSize: "10px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              data-testid={`button-approve-${item.id}`}
            >
              {statusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Approve
            </button>
          )}

          {item.status !== "rejected" && item.status !== "posted" && (
            <button
              onClick={() => setShowRejectModal(true)}
              style={{
                background: "transparent",
                border: `1px solid rgba(193,78,60,0.4)`,
                color: RED,
                padding: "9px 16px",
                fontSize: "10px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              data-testid={`button-reject-${item.id}`}
            >
              <X className="w-3 h-3" />
              Reject
            </button>
          )}

          {item.status === "approved" && (
            <button
              onClick={() => postMutation.mutate()}
              disabled={postMutation.isPending || postMutation.isSuccess}
              style={{
                background: "rgba(201,168,76,0.1)",
                border: `1px solid ${GOLD}`,
                color: GOLD,
                padding: "9px 16px",
                fontSize: "10px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              data-testid={`button-post-${item.id}`}
            >
              {postMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : postMutation.isSuccess ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              {postMutation.isPending ? "Posting..." : postMutation.isSuccess ? "Posted" : "Post Now"}
            </button>
          )}

          <div className="flex-1" />

          {/* Scheduled time display */}
          {item.scheduledDate && (
            <div className="flex items-center gap-1.5" style={{ fontFamily: "'Menlo', monospace", fontSize: "10px", letterSpacing: "2px", color: GOLD_DIM }}>
              <Clock className="w-3 h-3" />
              <span>{new Date(item.scheduledDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && <InstagramLightbox item={item} onClose={() => setShowLightbox(false)} />}

      {/* Reject modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent
          style={{
            background: "#15140e",
            border: `1px solid ${GOLD}`,
            color: CREAM,
          }}
          data-testid="reject-modal"
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: "italic",
                color: GOLD,
                fontSize: "22px",
              }}
            >
              Reject Content
            </DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: "13px", color: GOLD_DIM, marginBottom: "8px" }}>
            Provide a note for rejection (optional):
          </p>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="e.g. Image quality too low, caption needs revision..."
            className="min-h-[80px] text-sm"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${GOLD_DARK}`,
              color: CREAM,
            }}
            data-testid="input-reject-note"
          />
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => setShowRejectModal(false)}
              style={{
                background: "transparent",
                border: `1px solid ${GOLD_DARK}`,
                color: GOLD_DIM,
                padding: "8px 16px",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                statusMutation.mutate({ status: "rejected", note: rejectNote });
                setShowRejectModal(false);
                setRejectNote("");
              }}
              style={{
                background: "rgba(193,78,60,0.15)",
                border: `1px solid ${RED}`,
                color: RED,
                padding: "8px 16px",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
              data-testid="button-confirm-reject"
            >
              Reject
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ContentQueue() {
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: items = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
  });

  const filtered = items.filter((item) => {
    if (activeFilter === "All") return true;
    const lower = activeFilter.toLowerCase();
    if (["draft", "approved", "posted", "rejected"].includes(lower)) return item.status === lower;
    return item.campaign === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filter toolbar */}
      <div
        className="flex flex-wrap items-center gap-2"
        style={{ marginBottom: "8px" }}
        data-testid="filter-bar"
      >
        {/* Section label */}
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: GOLD_DIM,
            fontFamily: "'Helvetica Neue', sans-serif",
            marginRight: "4px",
          }}
        >
          Filter
        </span>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              background: activeFilter === f ? "rgba(201,168,76,0.12)" : "transparent",
              border: `1px solid ${activeFilter === f ? GOLD : GOLD_DARK}`,
              color: activeFilter === f ? CREAM : GOLD_DIM,
              padding: "7px 13px",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'Helvetica Neue', sans-serif",
              transition: "all 0.15s",
            }}
            data-testid={`filter-${f.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {f}
          </button>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "'Menlo', monospace",
            fontSize: "10px",
            letterSpacing: "2px",
            color: GOLD_DIM,
          }}
        >
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Hairline divider */}
      <div style={{ height: "1px", background: "rgba(201,168,76,0.15)" }} />

      {/* Content list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" style={{ background: "rgba(201,168,76,0.05)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "28px",
              color: CREAM,
              marginBottom: "12px",
            }}
          >
            No content found
          </p>
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: GOLD_DIM,
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Try a different filter
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
