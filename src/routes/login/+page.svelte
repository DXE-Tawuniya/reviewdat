<script>
	import TopBar from '$lib/components/TopBar.svelte';
	import { translator } from '$lib/i18n.js';
	let { data, form } = $props();
	const t = $derived(translator(data.lang));
</script>

<svelte:head><title>{t('signIn')} · reviewdat</title></svelte:head>

<TopBar title={t('signIn')} lang={data.lang} />
<main>
	<form method="POST" class="sec">
		<p class="muted" style="margin:0">{t('gateBody')}</p>
		{#if form?.error}<div class="error" role="alert">{form.error}</div>{/if}
		<input type="hidden" name="next" value={data.next} />
		<label class="f">{t('email')}<input class="input" id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} /></label>
		<label class="f">{t('password')}<input class="input" id="password" name="password" type="password" autocomplete="current-password" required /></label>
		<button class="btn block">{t('signIn')}</button>
		<p class="small muted" style="margin:0">{t('noAccount')} <a href="/register?next={encodeURIComponent(data.next)}">{t('signUp')}</a></p>
	</form>
</main>
