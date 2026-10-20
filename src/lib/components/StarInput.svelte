<script>
	import { Star } from '@lucide/svelte';
	let { name, value = $bindable(0), label } = $props();
</script>

<fieldset class="starin">
	<legend>{label}</legend>
	<div class="row-stars">
		{#each [1, 2, 3, 4, 5] as i (i)}
			<label class:on={i <= value}>
				<input type="radio" {name} value={i} checked={value === i} onchange={() => (value = i)} />
				<span aria-hidden="true"><Star size={32} fill="currentColor" strokeWidth={1.5} /></span><span class="sr">{i} / 5</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
	legend { font-weight: 600; padding: 0; margin-bottom: 4px; }
	.row-stars { display: flex; gap: 4px; }
	label { line-height: 0; color: var(--line-strong); cursor: pointer; padding: 2px; border-radius: 6px; position: relative; }
	label.on { color: var(--rating); }
	label:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px; }
	input { position: absolute; opacity: 0; width: 1px; height: 1px; }
	.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
</style>
