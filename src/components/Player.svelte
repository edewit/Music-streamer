<script lang="ts">
  import { untrack } from "svelte";
  import MusicList from "../components/MusicList.svelte";
  import CoverArt from "./CoverArt.svelte";
  import ProgressBar from "./ProgressBar.svelte";

  let player = $state<HTMLAudioElement | null>(null);
  let music = $state<string[]>([]);
  let src = $state<string | undefined>();
  let currentTime = $state(0);
  let duration = $state(0);
  let isPlaying = $state(false);

  let song = $derived(src ? `/music/${src}` : "");

  $effect(() => {
    if (song) {
      untrack(() => player?.pause());

      const newPlayer = new Audio(song);

      newPlayer.onloadedmetadata = () => {
        untrack(() => {
          duration = newPlayer.duration || 0;
        });
      };

      newPlayer.ontimeupdate = () => {
        untrack(() => {
          currentTime = newPlayer.currentTime || 0;
        });
      };

      newPlayer.onplay = () => {
        untrack(() => {
          isPlaying = true;
        });
      };

      newPlayer.onpause = () => {
        untrack(() => {
          isPlaying = false;
        });
      };

      untrack(() => {
        player = newPlayer;
        isPlaying = false;
      });
    }
  });

  $effect.root(() => {
    fetch("/music/!")
      .then((res) => res.json())
      .then((data) => (music = data));
    return () => {};
  });

  function play({ detail: { song } }: { detail: { song: string } }) {
    src = song;
  }

  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function seek(event: MouseEvent | KeyboardEvent): void {
    if (!player || !duration) return;
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    let x: number;
    if (event instanceof MouseEvent) {
      x = event.clientX - bounds.left;
    } else {
      // For keyboard events, seek to middle or use arrow keys
      x = bounds.width / 2;
    }
    const percent = x / bounds.width;
    player.currentTime = percent * duration;
  }

  function nextTrack(): void {
    if (!src || music.length === 0) return;
    const currentIndex = music.indexOf(src);
    const nextIndex = (currentIndex + 1) % music.length;
    src = music[nextIndex];
  }

  function previousTrack(): void {
    if (!src || music.length === 0) return;
    const currentIndex = music.indexOf(src);
    const prevIndex = currentIndex <= 0 ? music.length - 1 : currentIndex - 1;
    src = music[prevIndex];
  }
</script>

<!-- component -->
<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
  <div class="max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
    <CoverArt song={src} />
    <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
    <div
      class="flex justify-between text-xs font-semibold text-gray-500 px-4 py-2"
    >
      <div>{formatTime(currentTime)}</div>
      <div class="flex space-x-3 p-2">
        <button
          class="focus:outline-none"
          aria-label="Previous track"
          onclick={previousTrack}
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><polygon points="19 20 9 12 19 4 19 20" /><line
              x1="5"
              y1="19"
              x2="5"
              y2="5"
            /></svg
          >
        </button>
        <button
          onclick={() => player && (isPlaying ? player.pause() : player.play())}
          class="rounded-full w-8 h-8 flex items-center justify-center pl-0.5 ring-2 ring-gray-100 focus:outline-none"
        >
          {#if !isPlaying}
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><polygon points="5 3 19 12 5 21 5 3" /></svg
            >
          {:else}
            <svg
              x="0px"
              y="0px"
              viewBox="0 0 122.88 122.88"
              style="enable-background:new 0 0 122.88 122.88"
              xml:space="preserve"
              ><g
                ><path
                  d="M61.44,0c16.97,0,32.33,6.88,43.44,18c11.12,11.12,18,26.48,18,43.44c0,16.97-6.88,32.33-18,43.44 c-11.12,11.12-26.48,18-43.44,18c-16.97,0-32.33-6.88-43.44-18C6.88,93.77,0,78.41,0,61.44C0,44.47,6.88,29.11,18,18 C29.11,6.88,44.47,0,61.44,0L61.44,0z M42.3,39.47h13.59v43.95l-13.59,0V39.47L42.3,39.47L42.3,39.47z M66.99,39.47h13.59v43.95 l-13.59,0V39.47L66.99,39.47L66.99,39.47z M97.42,25.46c-9.21-9.21-21.93-14.9-35.98-14.9c-14.05,0-26.78,5.7-35.98,14.9 c-9.21,9.21-14.9,21.93-14.9,35.98s5.7,26.78,14.9,35.98c9.21,9.21,21.93,14.9,35.98,14.9c14.05,0,26.78-5.7,35.98-14.9 c9.21-9.21,14.9-21.93,14.9-35.98S106.63,34.66,97.42,25.46L97.42,25.46z"
                /></g
              ></svg
            >
          {/if}
        </button>
        <button
          class="focus:outline-none"
          aria-label="Next track"
          onclick={nextTrack}
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><polygon points="5 4 15 12 5 20 5 4" /><line
              x1="19"
              y1="5"
              x2="19"
              y2="19"
            /></svg
          >
        </button>
      </div>
      <div>{formatTime(duration)}</div>
    </div>
    <MusicList {music} onplay={play} />
  </div>
</div>
