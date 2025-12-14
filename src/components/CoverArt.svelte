<script>
    let { song } = $props();
    let details = $state(Promise.resolve(null));

    let src = $derived(song ? "/music/cover/" + song : "");

    $effect(() => {
        if (song) {
            details = fetchDetails(song);
        }
    });

    async function fetchDetails(currentSong) {
        if (!currentSong) return null;
        
        try {
            const res = await fetch("/music/info/" + currentSong);
            const tag = await res.json();

            if (res.ok) {
                return tag;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }
</script>

<div class="relative">
    <img
        {src}
        class="object-cove max-w-full h-auto"
        style="min-width: 600px;"
        alt={song}
        onerror={(e) => (e.target.src = "/empty.png")}
    />

    <div
        class="absolute p-4 inset-0 flex flex-col justify-end bg-gradient-to-b from-transparent to-gray-900 backdrop backdrop-blur-5 text-white"
    >
        {#await details then tags}
            {#if tags && tags.artist}
                <h3 class="font-bold">{tags.artist}</h3>
                <span class="opacity-70">{tags.title}</span>
            {:else if song}
                <h3 class="font-bold">{song}</h3>
            {/if}
        {/await}
    </div>
</div>
