// parallax.js — initialize Locomotive Scroll + GSAP ScrollTrigger sync

(function () {

  if (typeof LocomotiveScroll === 'undefined') return;

  const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]') || document.body,
    smooth: true,
    direction: 'vertical'
  });

  // Sync Locomotive with GSAP ScrollTrigger
  if (window.gsap && window.ScrollTrigger) {

    gsap.registerPlugin(ScrollTrigger);

    scroll.on('scroll', ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length
          ? scroll.scrollTo(value)
          : scroll.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    });

    ScrollTrigger.addEventListener('refresh', () => scroll.update());
    ScrollTrigger.refresh();
  }

})();
