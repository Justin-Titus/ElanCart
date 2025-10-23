import React, {
  Children,
  cloneElement,
  createRef,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import gsap from 'gsap';
import styles from './CardSwap.module.css';

export const Card = forwardRef(({ className = '', customClass, ...rest }, ref) => {
  const classes = [styles.card, className, customClass].filter(Boolean).join(' ');
  return <div ref={ref} {...rest} className={classes} />;
});

Card.displayName = 'Card';

const makeSlot = (index, distX, distY, total) => ({
  x: index * distX,
  y: -index * distY,
  z: -index * distX * 1.5,
  zIndex: total - index
});

const placeNow = (element, slot, skew) => {
  if (!element) {
    return;
  }

  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });
};

const getAnimationConfig = (easing) =>
  easing === 'elastic'
    ? {
        ease: 'elastic.out(0.6, 0.9)',
        durDrop: 2,
        durMove: 2,
        durReturn: 2,
        promoteOverlap: 0.9,
        returnDelay: 0.05
      }
    : {
        ease: 'power1.inOut',
        durDrop: 0.8,
        durMove: 0.8,
        durReturn: 0.8,
        promoteOverlap: 0.45,
        returnDelay: 0.2
      };

const CardSwap = ({
  width = 340,
  height = 440,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 4500,
  pauseOnHover = true,
  pauseOnFocus = true,
  onCardClick,
  onPauseChange,
  skewAmount = 6,
  easing = 'elastic',
  children,
  className = '',
  role: roleProp,
  tabIndex: tabIndexProp,
  ...restProps
}) => {
  const childArray = useMemo(() => Children.toArray(children), [children]);
  const config = useMemo(() => getAnimationConfig(easing), [easing]);
  const refs = useMemo(
    () => childArray.map(() => createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArray.length]
  );

  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const swapHandlerRef = useRef(() => {});
  const intervalRef = useRef(null);
  const orderRef = useRef(Array.from({ length: childArray.length }, (_, index) => index));
  const isPausedRef = useRef(false);
  const pauseCallbackRef = useRef(onPauseChange);

  useEffect(() => {
    pauseCallbackRef.current = onPauseChange;
  }, [onPauseChange]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setPaused = useCallback(
    (value) => {
      if (isPausedRef.current === value) {
        return;
      }
      isPausedRef.current = value;
      pauseCallbackRef.current?.(value);
    },
    []
  );

  const startTimer = useCallback(
    () => {
      clearTimer();
      if (delay <= 0 || childArray.length <= 1) {
        return;
      }
      intervalRef.current = window.setInterval(() => {
        swapHandlerRef.current('forward');
      }, delay);
    },
    [childArray.length, clearTimer, delay]
  );

  const pauseAnimation = useCallback(() => {
    setPaused(true);
    timelineRef.current?.pause();
    clearTimer();
  }, [clearTimer, setPaused]);

  const resumeAnimation = useCallback(() => {
    setPaused(false);
    timelineRef.current?.play();
    startTimer();
  }, [setPaused, startTimer]);

  useEffect(() => {
    if (!childArray.length) {
      return undefined;
    }

    const total = refs.length;
    refs.forEach((ref, index) => {
      placeNow(ref.current, makeSlot(index, cardDistance, verticalDistance, total), skewAmount);
    });

    const swap = (direction = 'forward') => {
      if (orderRef.current.length < 2) {
        return;
      }

      const order = orderRef.current;
      let frontIndex;
      let rest;

      if (direction === 'forward') {
        [frontIndex, ...rest] = order;
      } else {
        const last = order[order.length - 1];
        rest = order.slice(0, -1);
        frontIndex = last;
      }

      const frontElement = refs[frontIndex]?.current;
      if (!frontElement) {
        return;
      }

      const tl = gsap.timeline();
      timelineRef.current = tl;

      tl.to(frontElement, {
        y: "+=520",
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

      rest.forEach((nodeIndex, position) => {
        const element = refs[nodeIndex]?.current;
        if (!element) {
          return;
        }
        const slot = makeSlot(position, cardDistance, verticalDistance, refs.length);
        tl.set(element, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          element,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${position * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => {
        gsap.set(frontElement, { zIndex: backSlot.zIndex });
      }, undefined, 'return');
      tl.to(
        frontElement,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        if (direction === 'forward') {
          orderRef.current = [...rest, frontIndex];
        } else {
          orderRef.current = [frontIndex, ...rest];
        }
      });
    };

    swapHandlerRef.current = swap;
    swap('forward');
    startTimer();

    const node = containerRef.current;
    if (!node) {
      return () => {
        clearTimer();
      };
    }

    const handleMouseEnter = () => {
      if (pauseOnHover) {
        pauseAnimation();
      }
    };

    const handleMouseLeave = () => {
      if (pauseOnHover) {
        resumeAnimation();
      }
    };

    const handleFocusIn = () => {
      if (pauseOnFocus) {
        pauseAnimation();
      }
    };

    const handleFocusOut = () => {
      if (pauseOnFocus) {
        resumeAnimation();
      }
    };

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);
    node.addEventListener('focusin', handleFocusIn);
    node.addEventListener('focusout', handleFocusOut);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
      node.removeEventListener('focusin', handleFocusIn);
      node.removeEventListener('focusout', handleFocusOut);
      clearTimer();
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, pauseOnFocus, refs, childArray.length, config, skewAmount, pauseAnimation, resumeAnimation, startTimer, clearTimer]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === ' ') {
      event.preventDefault();
      pauseAnimation();
      swapHandlerRef.current('forward');
      window.setTimeout(resumeAnimation, 200);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      pauseAnimation();
      swapHandlerRef.current('backward');
      window.setTimeout(resumeAnimation, 200);
    }
  }, [pauseAnimation, resumeAnimation]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const renderedChildren = childArray.map((child, index) => {
    if (!isValidElement(child)) {
      return child;
    }

    return cloneElement(child, {
      key: index,
      ref: refs[index],
      style: { width, height, ...(child.props.style ?? {}) },
      onClick: (event) => {
        child.props.onClick?.(event);
        onCardClick?.(index);
      }
    });
  });

  const combinedClassName = [styles.container, className].filter(Boolean).join(' ');
  const role = roleProp ?? 'list';
  const tabIndex = typeof tabIndexProp === 'number' ? tabIndexProp : 0;

  return (
    <div
      ref={containerRef}
      className={combinedClassName}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
      role={role}
      aria-roledescription="carousel"
      {...restProps}
    >
      {renderedChildren}
    </div>
  );
};

export default CardSwap;
