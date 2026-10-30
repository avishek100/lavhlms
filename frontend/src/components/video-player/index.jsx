import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import PropTypes from "prop-types";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

function VideoPlayer({
  width = "100%",
  height = "100%",
  url,
  onProgressUpdate,
  progressData = {},
  maxPreviewSeconds,
  onPreviewLimitReached,
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const hasReportedCompletionRef = useRef(false);
  const hasReachedPreviewLimitRef = useRef(false);

  function handlePlayAndPause() {
    if (maxPreviewSeconds && hasReachedPreviewLimitRef.current) return;
    setPlaying(!playing);
  }

  function handleProgress(state) {
    if (
      maxPreviewSeconds &&
      state.playedSeconds >= maxPreviewSeconds &&
      !hasReachedPreviewLimitRef.current
    ) {
      hasReachedPreviewLimitRef.current = true;
      playerRef.current?.seekTo(maxPreviewSeconds, "seconds");
      setPlayed(
        playerRef.current?.getDuration()
          ? Math.min(maxPreviewSeconds / playerRef.current.getDuration(), 1)
          : state.played
      );
      setPlaying(false);
      onPreviewLimitReached?.();
      return;
    }

    if (!seeking) {
      setPlayed(
        maxPreviewSeconds
          ? Math.min(
              state.played,
              maxPreviewSeconds /
                (playerRef.current?.getDuration() || maxPreviewSeconds)
            )
          : state.played
      );
    }
  }

  function handleToggleMute() {
    setMuted(!muted);
  }

  function handleSeekChange(value) {
    const duration = playerRef.current?.getDuration() || 0;
    const maxPlayed = maxPreviewSeconds && duration
      ? Math.min(maxPreviewSeconds / duration, 1)
      : 1;
    setPlayed(Math.min(value / 100, maxPlayed));
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    const duration = playerRef.current?.getDuration() || 0;
    const seekPosition =
      maxPreviewSeconds && duration
        ? Math.min(played * duration, maxPreviewSeconds)
        : played;
    playerRef.current?.seekTo(
      maxPreviewSeconds && duration ? seekPosition : played,
      maxPreviewSeconds && duration ? "seconds" : "fraction"
    );
  }

  function pad(string) {
    return ("0" + string).slice(-2);
  }

  function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());

    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`;
    }

    return `${mm}:${ss}`;
  }

  const handleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      if (playerContainerRef?.current.requestFullscreen) {
        playerContainerRef?.current?.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  function handleMouseMove() {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    setPlayed(0);
    setPlaying(false);
    setSeeking(false);
    hasReportedCompletionRef.current = false;
    hasReachedPreviewLimitRef.current = false;
  }, [url]);

  useEffect(() => {
    if (!onProgressUpdate) return;
    if (played < 1) {
      hasReportedCompletionRef.current = false;
    } else if (!hasReportedCompletionRef.current) {
      hasReportedCompletionRef.current = true;
      onProgressUpdate({
        ...progressData,
        progressValue: played,
      });
    }
  }, [played, onProgressUpdate, progressData]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out 
      ${isFullScreen ? "w-screen h-screen" : ""}
      `}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <ReactPlayer
        ref={playerRef}
        className="absolute top-0 left-0"
        width="100%"
        height="100%"
        url={url}
        playing={playing}
        volume={0.5}
        muted={muted}
        onProgress={handleProgress}
      />
      {showControls && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <Slider
            value={[played * 100]}
            max={
              maxPreviewSeconds && playerRef.current?.getDuration()
                ? Math.min(
                    (maxPreviewSeconds / playerRef.current.getDuration()) *
                      100,
                    100
                  )
                : 100
            }
            step={0.1}
            onValueChange={(value) => handleSeekChange(value[0])}
            onValueCommit={handleSeekMouseUp}
            className="mb-2 w-full"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayAndPause}
                aria-label={playing ? "Pause video" : "Play video"}
                className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
              >
                {playing ? (
                  <Pause aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Play aria-hidden="true" className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleToggleMute}
                variant="ghost"
                size="icon"
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
              >
                {muted ? (
                  <VolumeX aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Volume2 aria-hidden="true" className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-xs tabular-nums text-white">
              {formatTime(played * (playerRef?.current?.getDuration() || 0))} /{" "}
              {formatTime(
                maxPreviewSeconds
                  ? Math.min(
                      maxPreviewSeconds,
                      playerRef?.current?.getDuration() || maxPreviewSeconds
                    )
                  : playerRef?.current?.getDuration() || 0
              )}
            </div>
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullScreen}
                aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
              >
                {isFullScreen ? (
                  <Minimize aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Maximize aria-hidden="true" className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      {maxPreviewSeconds && hasReachedPreviewLimitRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 p-6 text-center text-white">
          <div>
            <p className="font-semibold">1-minute preview complete</p>
            <p className="mt-2 text-sm text-slate-200">
              Sign in or create an account to continue learning.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

VideoPlayer.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  url: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  onProgressUpdate: PropTypes.func,
  progressData: PropTypes.object,
  maxPreviewSeconds: PropTypes.number,
  onPreviewLimitReached: PropTypes.func,
};

export default VideoPlayer;
