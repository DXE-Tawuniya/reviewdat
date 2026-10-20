<script>
	import { Receipt, Check } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import StarInput from '$lib/components/StarInput.svelte';
	import { CATEGORIES, PROOF_METHODS, stepsFor, MIN_TEXT } from '$lib/templates.js';
	import { translator } from '$lib/i18n.js';

	let { data, form } = $props();
	const t = $derived(translator(data.lang));
	const c = $derived(CATEGORIES[data.item.category]);
	const steps = $derived(stepsFor(data.item.category));
	const draftKey = $derived(`rd_draft_${data.item.id}`);

	let step = $state(0);
	let method = $state(CATEGORIES[data.item.category].proofs[0]);
	let fileName = $state('');
	let extra = $state('');
	let crit = $state({});
	let rating = $state(0);
	let text = $state('');
	let pros = $state('');
	let cons = $state('');
	let busy = $state(false);

	const current = $derived(steps[step]);
	const stepOk = $derived.by(() => {
		if (current === 'proof') return !!fileName;
		if (current === 'extra') return !!extra;
		if (current === 'criteria') return c.criteria.every((cr) => crit[cr.key] > 0);
		if (current === 'text') return rating > 0 && text.trim().length >= MIN_TEXT;
		return true;
	});

	onMount(() => {
		try {
			const d = JSON.parse(localStorage.getItem(draftKey) ?? 'null');
			if (d) ({ method, extra, crit, rating, text, pros, cons } = { ...d, crit: d.crit ?? {} });
		} catch { /* storage unavailable */ }
	});

	$effect(() => {
		const d = { item: data.item.name, step, method, extra, crit, rating, text, pros, cons, at: Date.now() };
		try {
			if (extra || rating || text) localStorage.setItem(draftKey, JSON.stringify(d));
		} catch { /* ignore */ }
	});

	$effect(() => {
		if (form?.error) step = steps.length - 1;
	});
</script>

<svelte:head><title>{t('writeReview')} · {data.item.name}</title></svelte:head>

<TopBar title={data.item.name} back="/items/{data.item.id}" lang={data.lang} />
<main>
	<div class="sec">
		<div class="steps" aria-hidden="true">{#each steps as _, i (i)}<i class:on={i <= step}></i>{/each}</div>
		<span class="small muted mono">{t('step')} {step + 1} {t('of')} {steps.length}</span>
	</div>

	{#if form?.error}<div class="error" role="alert">{form.error}</div>{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		class="sec"
		use:enhance={() => {
			busy = true;
			return async ({ result, update }) => {
				busy = false;
				if (result.type === 'redirect') { try { localStorage.removeItem(draftKey); } catch {} }
				await update({ reset: false });
			};
		}}
	>
		<section class="sec" hidden={current !== 'proof'}>
			<h2>{t('proofTitle')}</h2>
			<p class="muted" style="margin:0">{t('proofBody')}</p>
			<label class="f">{t('method')}
				<select class="input" name="method" id="method" bind:value={method}>
					{#each c.proofs as p (p)}<option value={p}>{t.l(PROOF_METHODS[p])}</option>{/each}
				</select>
			</label>
			<label class="drop">
				<span class="drop-ic" aria-hidden="true"><Receipt size={28} /></span>
				{#if fileName}<strong>{fileName}</strong><span class="badge ok"><Check strokeWidth={3} aria-label="OK" /></span>{:else}<span class="small muted">JPG, PNG, WEBP, HEIC, PDF{method === 'email' ? ', EML' : ''} · 8 MB</span>{/if}
				<span class="btn ghost small">{t('upload')}</span>
				<input class="vh" type="file" name="proof" id="proof" accept="image/*,application/pdf{method === 'email' ? ',.eml,message/rfc822' : ''}" onchange={(e) => (fileName = e.currentTarget.files?.[0]?.name ?? '')} />
			</label>
		</section>

		<section class="sec" hidden={current !== 'extra'}>
			<h2>{t.l(c.extra)}</h2>
			<div class="opts">
				{#each c.extra.options as o (o.value)}
					<label class="opt" class:on={extra === o.value}><input class="vh" type="radio" name="extra" value={o.value} bind:group={extra} />{t.l(o)}</label>
				{/each}
			</div>
		</section>

		<section class="sec" hidden={current !== 'criteria'}>
			<h2>{t('breakdown')}</h2>
			{#each c.criteria as cr (cr.key)}
				<StarInput name="c_{cr.key}" label={t.l(cr)} bind:value={crit[cr.key]} />
			{/each}
		</section>

		{#if c.prosCons}
			<section class="sec" hidden={current !== 'proscons'}>
				<h2>{t('pros')} / {t('cons')}</h2>
				<label class="f">{t('pros')}<input class="input" name="pros" id="pros" maxlength="300" bind:value={pros} /></label>
				<label class="f">{t('cons')}<input class="input" name="cons" id="cons" maxlength="300" bind:value={cons} /></label>
			</section>
		{/if}

		<section class="sec" hidden={current !== 'text'}>
			<StarInput name="rating" label={t('overall')} bind:value={rating} />
			<label class="f">{t('yourReview')}
				<textarea class="input" name="text" id="text" maxlength="5000" bind:value={text}></textarea>
				<span class="hint mono">{text.trim().length}/{MIN_TEXT} · {t('minChars')}</span>
			</label>
			<p class="small muted" style="margin:0">{t('demoNote')}</p>
		</section>

		<div class="row">
			{#if step > 0}<button type="button" class="btn ghost" style="flex:1" onclick={() => step--}>{t('back')}</button>{/if}
			{#if step < steps.length - 1}
				<button type="button" class="btn" style="flex:2" disabled={!stepOk} onclick={() => step++}>{t('next')}</button>
			{:else}
				<button type="submit" class="btn" style="flex:2" disabled={!stepOk || busy}>{busy ? '…' : t('submit')}</button>
			{/if}
		</div>
	</form>
</main>

<style>
	.steps { display: flex; gap: 4px; }
	.steps i { flex: 1; height: 4px; border-radius: 2px; background: var(--line); }
	.steps i.on { background: var(--brand); }
	.drop { border: 1.5px dashed var(--line); border-radius: var(--radius-lg); padding: 18px; text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center; background: var(--surface); cursor: pointer; position: relative; }
	.drop-ic { color: var(--brand); display: inline-flex; }
	.drop:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px; }
	.opts { display: flex; flex-wrap: wrap; gap: 8px; }
	.opt { border: 1px solid var(--line); background: var(--surface); border-radius: var(--radius-md); padding: 10px 14px; font-weight: 600; font-size: 14px; cursor: pointer; position: relative; }
	.opt.on { border-color: var(--brand); background: var(--brand-tint); }
	.opt:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px; }
	.vh { position: absolute; opacity: 0; width: 1px; height: 1px; inset: 0; }
</style>
