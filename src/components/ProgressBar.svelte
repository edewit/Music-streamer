<script lang="ts">
  interface Props {
    currentTime: number;
    duration: number;
    onSeek: (event: MouseEvent | KeyboardEvent) => void;
  }

  let { currentTime, duration, onSeek }: Props = $props();

  let time = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
</script>

<div
  class="relative h-1 bg-gray-200 cursor-pointer"
  role="slider"
  tabindex="0"
  aria-label="Seek slider"
  aria-valuenow={time}
  aria-valuemin="0"
  aria-valuemax="100"
  onclick={onSeek}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      onSeek(e);
    }
  }}
  onmousedown={(e) => {
    const handleMove = (moveEvent: MouseEvent) => onSeek(moveEvent);
    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    onSeek(e);
  }}
>
  <div
    class="absolute h-full bg-green-500 flex items-center justify-end pointer-events-none"
    style="width: {time}%;"
  >
    <div class="rounded-full w-3 h-3 bg-white shadow"></div>
  </div>
</div>
