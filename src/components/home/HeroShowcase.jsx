import React, { memo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardSwap, { Card } from './CardSwap';
import SplitText from '../common/SplitText';
import styles from './HeroShowcase.module.css';

const HeroShowcase = () => {
  const navigate = useNavigate();
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [cardSize, setCardSize] = useState(() => {
    if (typeof window === 'undefined') return { width: 300, height: 380, cardDistance: 60, verticalDistance: 68 };
    const w = window.innerWidth;
    if (w >= 1200) return { width: 300, height: 380, cardDistance: 60, verticalDistance: 68 };
    if (w >= 768) return { width: 300, height: 380, cardDistance: 60, verticalDistance: 70 };
    return { width: 260, height: 340, cardDistance: 42, verticalDistance: 48 };
  });

  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
  if (w >= 1200) setCardSize({ width: 300, height: 380, cardDistance: 60, verticalDistance: 68 });
  else if (w >= 992) setCardSize({ width: 300, height: 380, cardDistance: 60, verticalDistance: 68 });
      else if (w >= 768) setCardSize({ width: 300, height: 380, cardDistance: 60, verticalDistance: 70 });
      else if (w >= 480) setCardSize({ width: 280, height: 360, cardDistance: 48, verticalDistance: 56 });
      else setCardSize({ width: 240, height: 320, cardDistance: 36, verticalDistance: 44 });
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // products is null before load; do not use fallback data per request
  const [products, setProducts] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function fetchProducts() {
      try {
  const res = await fetch('https://dummyjson.com/products?limit=100', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!mounted) return;
        // pick 6 products preferring a 50/50 electronics + fashion mix
        const items = (data.products || []).filter(p => p.images && p.images.length);
  if (items.length > 0) {
          const electronicsCategories = new Set(['smartphones', 'laptops', 'home-decoration', 'lighting', 'sunglasses', 'automotive']);
          const fashionCategories = new Set(['mens-shirts', 'mens-shoes', 'womens-dresses', 'womens-shoes', 'womens-bags', 'tops']);

          const electronics = items.filter(p => electronicsCategories.has(p.category));
          const fashion = items.filter(p => fashionCategories.has(p.category));

          const chosen = [];
          const takeFrom = (arr, n) => {
            for (let i = 0; i < arr.length && chosen.length < n; i++) {
              if (!chosen.some(c => c.id === arr[i].id)) chosen.push(arr[i]);
            }
          };

          // try to take 3 electronics and 3 fashion
          takeFrom(electronics, 3);
          takeFrom(fashion, 6); // second call fills up to total 6 (remaining slots)

          // if still not enough, fill from any other items
          if (chosen.length < 6) {
            for (let i = 0; i < items.length && chosen.length < 6; i++) {
              if (!chosen.some(c => c.id === items[i].id)) chosen.push(items[i]);
            }
          }

          setProducts(chosen.slice(0, 6).map(p => ({ id: p.id, name: p.title, price: p.price, image: p.images[0] })));
        } else {
          // no products matched; mark as loaded empty (do not render CardSwap)
          setProducts([]);
        }
      } catch (err) {
        // keep fallback static products
        console.debug('HeroShowcase: product fetch failed', err?.message || err);
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const handleNavigateProducts = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const handleViewProduct = useCallback(
    (productId) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const handleCarouselPauseChange = useCallback((paused) => {
    setIsCarouselPaused(paused);
  }, []);

  return (
    <section className={styles.heroContainer} aria-label="Featured products highlight">
      <div className={styles.textSection}>
        <SplitText
          text="ElanCart makes everyday shopping effortless."
          className={styles.heading}
          delay={50}
          duration={0.8}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 50 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.2}
          rootMargin="0px"
          textAlign="left"
          tag="h1"
        />
        <p className={styles.subheading}>
          Explore curated collections, save your favourites, and check out with confidence. We blend modern design with reliable service so every purchase feels rewarding.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={handleNavigateProducts}>
            Start Shopping
          </button>
        </div>
      </div>

      <div className={styles.cardSection} aria-live={isCarouselPaused ? 'off' : 'polite'}>
        <div className={styles.cardSwapWrapper}>
          {Array.isArray(products) && products.length > 0 ? (
            <CardSwap
              width={cardSize.width}
              height={cardSize.height}
              cardDistance={cardSize.cardDistance}
              verticalDistance={cardSize.verticalDistance}
              delay={4200}
              pauseOnHover
              pauseOnFocus
              onPauseChange={handleCarouselPauseChange}
              aria-label="Hero featured products"
            >
              {products.map((product) => (
                <Card key={product.id} className={styles.showcaseCard} role="listitem" aria-label={`${product.name} for ₹${(product.price * 83).toFixed(2)}`}>
                  <figure className={styles.cardFigure}>
                    <img src={product.image} alt={product.name} className={styles.cardImage} loading="lazy" />
                  </figure>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{product.name}</h3>
                    <p className={styles.cardPrice}>₹{(product.price * 83).toFixed(2)}</p>
                    <button type="button" className={styles.cardCta} onClick={() => handleViewProduct(product.id)}>
                      View product
                    </button>
                  </div>
                </Card>
              ))}
            </CardSwap>
          ) : (
            // when products is null (loading) or empty (no results), render nothing for the carousel
            null
          )}
        </div>
      </div>
    </section>
  );
};

export default memo(HeroShowcase);
