import { useEffect } from 'react';

// Simple route preloader: triggers dynamic imports for key routes so Vite
// can fetch chunks early. Returns null (no visual UI).
export default function RoutePreloader() {
	useEffect(() => {
		const loaders = [
			() => import('../../pages/HomePage'),
			() => import('../../pages/ProductsPage'),
			() => import('../../pages/CartPage'),
		];

			loaders.forEach((l) => {
				try {
					l();
				} catch {
					// swallow — prefetch is best-effort
				}
			});
	}, []);

	return null;
}
