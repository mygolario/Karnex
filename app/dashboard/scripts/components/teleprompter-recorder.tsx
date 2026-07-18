"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  X, Play, Pause, Video, VideoOff, Disc, Square, 
  RotateCcw, Sparkles, MonitorPlay, Eye, FlipHorizontal, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface TeleprompterRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  scriptTitle: string;
  scriptText: string;
}

export function TeleprompterRecorder({ 
  isOpen, 
  onClose, 
  scriptTitle, 
  scriptText 
}: TeleprompterRecorderProps) {
  const isMobile = useIsMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const [fontSize, setFontSize] = useState(isMobile ? 28 : 36);
  const [isMirrored, setIsMirrored] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(60);
  const [layoutMode, setLayoutMode] = useState<"pip" | "fullscreen">(isMobile ? "fullscreen" : "pip");
  
  // Camera & Recording State
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  // Stop camera on unmount or close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Teleprompter scroll interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && isPlaying && scrollerRef.current) {
      interval = setInterval(() => {
        if (scrollerRef.current) {
          scrollerRef.current.scrollTop += scrollSpeed / 2;
        }
      }, 16);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, scrollSpeed]);

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsCameraOn(false);
      if (videoRef.current) videoRef.current.srcObject = null;
      toast.info("دوربین خاموش شد");
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        setStream(mediaStream);
        setIsCameraOn(true);
        // Delay binding to allow video element to render if in DOM
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }, 100);
        toast.success("دوربین و میکروفون فعال شدند");
      } catch (err) {
        console.error("Camera access error:", err);
        toast.error("دسترسی به دوربین یا میکروفون امکان‌پذیر نیست. لطفا دسترسی مرورگر را بررسی کنید.");
      }
    }
  };

  const startRecording = () => {
    if (!isCameraOn || !stream) {
      toast.error("ابتدا دوربین خود را روشن کنید");
      return;
    }
    recordedChunks.current = [];
    try {
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }
      
      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = `${scriptTitle || "script"}-recording.webm`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("ویدیو ضبط شد و در حال دانلود است! 🎬");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setIsPlaying(true); // start scrolling automatically
      toast.info("ضبط ویدیو آغاز شد");
    } catch (err) {
      console.error("Start recording error:", err);
      toast.error("خطا در شروع ضبط ویدیو");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPlaying(false);
    }
  };

  const resetScroller = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
      setIsPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden font-sans select-none">
      
      {/* Top Toolbar */}
      <div className="h-20 shrink-0 bg-zinc-950/90 border-b border-white/10 flex items-center justify-between px-6 z-20 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-zinc-400 hover:text-white hover:bg-white/10 gap-1.5"
            onClick={() => {
              if (stream) stream.getTracks().forEach(track => track.stop());
              onClose();
            }}
          >
            <X size={20} />
            خروج از تودیو ضبط
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <h2 className="text-sm font-bold text-zinc-300 line-clamp-1 max-w-[200px]">
            {scriptTitle || "بدون نام"}
          </h2>
        </div>

        {/* Speed, Font, Mirror controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">سرعت</span>
            <Slider 
              value={[scrollSpeed]} 
              onValueChange={(val) => setScrollSpeed(val[0])} 
              min={1}
              max={10} 
              step={1} 
              className="w-24"
            />
            <span className="text-xs text-zinc-500 font-mono w-4">{scrollSpeed}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">سایز متن</span>
            <Slider 
              value={[fontSize]} 
              onValueChange={(val) => setFontSize(val[0])} 
              min={20}
              max={80} 
              step={2} 
              className="w-24"
            />
            <span className="text-xs text-zinc-500 font-mono w-6">{fontSize}px</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-400">حالت آینه</span>
              <Switch checked={isMirrored} onCheckedChange={setIsMirrored} />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-zinc-400">شفافیت پس‌زمینه</span>
              <Slider
                value={[bgOpacity]}
                onValueChange={(val) => setBgOpacity(val[0])}
                min={0}
                max={100}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Layout Modes & Recording Actions */}
        <div className="flex items-center gap-3">
          {isCameraOn && (
            <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-0.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("text-xs h-7 px-2.5", layoutMode === "pip" && "bg-zinc-800 text-white")}
                onClick={() => setLayoutMode("pip")}
              >
                کادر کوچک
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("text-xs h-7 px-2.5", layoutMode === "fullscreen" && "bg-zinc-800 text-white")}
                onClick={() => setLayoutMode("fullscreen")}
              >
                تمام‌صفحه (پشت متن)
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant={isCameraOn ? "destructive" : "secondary"}
            className="gap-1.5 h-9"
            onClick={toggleCamera}
            disabled={isRecording}
          >
            {isCameraOn ? <VideoOff size={16} /> : <Video size={16} />}
            {isCameraOn ? "خاموش کردن وب‌کم" : "روشن کردن وب‌کم"}
          </Button>

          {isCameraOn && (
            <Button
              size="sm"
              className={cn(
                "gap-1.5 h-9 font-bold",
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse text-white" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square size={16} fill="currentColor" /> : <Disc size={16} className="animate-spin" />}
              {isRecording ? "توقف ضبط" : "شروع ضبط"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Studio Frame */}
      <div className="flex-1 relative flex overflow-hidden bg-black">
        
        {/* Fullscreen Camera Stream behind text */}
        {isCameraOn && layoutMode === "fullscreen" && (
          <div className="absolute inset-0 z-0">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={cn(
                "w-full h-full object-cover",
                isMirrored && "scale-x-[-1]"
              )}
            />
          </div>
        )}

        {/* Text Scroller Container */}
        <div 
          className="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none"
          style={{ 
            backgroundColor: `rgba(0, 0, 0, ${bgOpacity / 100})`
          }}
        >
          {/* Visual Target Area (Focus Area for eye contact) */}
          <div className="absolute top-1/2 left-0 right-0 h-28 -translate-y-1/2 border-y-2 border-red-500/20 bg-red-500/5 pointer-events-none z-20 flex items-center justify-between px-8">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">نگاه اینجاست</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          </div>

          {/* Scrolling Text Element */}
          <div 
            ref={scrollerRef} 
            className={cn(
              "h-full w-full overflow-y-scroll scrollbar-hide px-[15%] py-[45vh] pointer-events-auto cursor-pointer select-none",
              isMirrored && "scale-x-[-1]"
            )}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <p 
              className="font-bold leading-relaxed text-center" 
              style={{ fontSize: `${fontSize}px` }}
              dir="rtl"
            >
              {scriptText.split('\n').map((line, i) => {
                const trimmed = line.trim();
                const isVisualCue = trimmed.startsWith('[') || trimmed.startsWith('(') || trimmed.startsWith('*');
                return (
                  <span key={i} className={cn(
                      "block mb-10 transition-all duration-300",
                      isVisualCue ? "text-yellow-400 text-[0.7em] opacity-75 font-semibold" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  )}>
                    {line}
                  </span>
                );
              })}
            </p>
          </div>
        </div>

        {/* Picture-in-Picture (PiP) Floating Camera View */}
        {isCameraOn && layoutMode === "pip" && (
          <div className="absolute bottom-6 right-6 w-80 h-48 border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-30 bg-zinc-950">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={cn(
                "w-full h-full object-cover",
                isMirrored && "scale-x-[-1]"
              )}
            />
            {isRecording && (
              <Badge className="absolute top-3 left-3 bg-red-600 text-white border-0 gap-1.5 animate-pulse">
                <Disc size={12} fill="currentColor animate-spin" />
                REC
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="h-24 shrink-0 bg-zinc-950/95 border-t border-white/10 flex items-center justify-center gap-6 z-20">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-white/10 bg-zinc-900 text-white hover:bg-zinc-800"
          onClick={resetScroller}
        >
          <RotateCcw size={20} />
        </Button>

        <Button 
          size="lg" 
          className={cn(
            "rounded-full w-16 h-16 flex items-center justify-center border-4 ring-2 ring-white/10 transition-all duration-200",
            isPlaying 
              ? "bg-amber-500 border-amber-900 text-black hover:bg-amber-600" 
              : "bg-red-600 border-red-900 text-white hover:bg-red-700"
          )}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </Button>

        {isRecording && (
          <div className="absolute left-6 text-red-500 flex items-center gap-2 text-sm font-bold bg-red-500/10 px-4 py-2 border border-red-500/20 rounded-full animate-pulse">
            <Disc size={16} fill="currentColor" />
            درحال ضبط ویدیو...
          </div>
        )}
      </div>
    </div>
  );
}
