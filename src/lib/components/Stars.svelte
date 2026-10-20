<script>
	import { Star } from '@lucide/svelte';
	let { value = 0, size = 15 } = $props();
</script>

<span class="stars" style="font-size:{size}px" role="img" aria-label="{Number(value).toFixed(1)} of 5">
	{#each [1, 2, 3, 4, 5] as i}<span class:off={value < i - 0.25}><Star size={size} fill="currentColor" strokeWidth={0} /></span>{/each}
</span>

<style>
	.stars { color: var(--rating); display: inline-flex; gap: 2px; vertical-align: middle; line-height: 0; }
	.off { color: var(--line-strong); }
</style>
