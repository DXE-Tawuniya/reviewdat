<script>
	import TopBar from '$lib/components/TopBar.svelte';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
</script>

<svelte:head><title>{t('profile')} · reviewdat</title></svelte:head>

<TopBar title={t('profile')} lang={data.lang} />
<main>
	{#if data.user}
		<div class="card sec">
			<div class="row">
				<div class="thumb">{data.user.name[0]}</div>
				<div style="min-width:0">
					<div class="small muted">{t('signedInAs')}</div>
					<strong>{data.user.name}</strong>
					<div class="small muted">{data.user.email}</div>
				</div>
			</div>
			<div class="row between"><span>{t('trust')}</span><span class="mono">{data.user.trust}/100</span></div>
		</div>
		{#if data.user.role === 'admin'}<a class="btn ghost block" href="/admin">{t('moderation')}</a>{/if}
		<form method="POST" action="/logout"><button class="btn ghost block">{t('signOut')}</button></form>
	{:else}
		<div class="card sec">
			<h2>{t('signIn')}</h2>
			<p class="muted" style="margin:0">{t('gateBody')}</p>
			<a class="btn block" href="/login">{t('signIn')}</a>
			<a class="btn ghost block" href="/register">{t('signUp')}</a>
			<span class="small muted">{t('guest')}</span>
		</div>
	{/if}
</main>
