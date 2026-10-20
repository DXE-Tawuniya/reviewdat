<script>
	import { page } from '$app/state';
</script>

<header class="top">
	<h1>
		<img class="logo logo-light" src="/reviewdat-logo.svg" alt="reviewdat" />
		<img class="logo logo-dark" src="/reviewdat-logo-dark-bg.svg" alt="reviewdat" />
	</h1>
</header>
<main>
	<p class="headline">{page.status}</p>
	<p class="muted">{page.error?.message}</p>
	<a class="btn block" href="/">Home</a>
</main>
