// Single source of truth for GSAP + plugins.
// Every initializer imports `gsap` (and plugins) from here so registration
// happens exactly once and only the plugins we actually use get bundled.
// Never import from 'gsap/*' anywhere else.
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(Flip, SplitText, ScrambleTextPlugin, ScrollTrigger, ScrollSmoother);

// Match the hand-tuned cubic-bezier(0.22, 1, 0.36, 1) feel used across the site.
gsap.defaults({ ease: 'expo.out', duration: 0.7 });

export { gsap, Flip, SplitText, ScrambleTextPlugin, ScrollTrigger, ScrollSmoother };
