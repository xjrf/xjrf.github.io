(() => {
    const glow = document.getElementById("modernGlow");
    if (!glow) return;

    const rootStyle = document.documentElement.style;
    const glowState = {
        currentX: window.innerWidth * 0.5,
        currentY: window.innerHeight * 0.2,
        targetX: window.innerWidth * 0.5,
        targetY: window.innerHeight * 0.2,
        lastInputX: window.innerWidth * 0.5,
        lastInputY: window.innerHeight * 0.2,
        currentFocus: 0,
        targetFocus: 0,
        currentFlowX: 0,
        currentFlowY: 0,
        targetFlowX: 0,
        targetFlowY: 0,
        currentSpeed: 0,
        targetSpeed: 0,
        dirX: 0,
        dirY: -1,
        wakeX: window.innerWidth * 0.5,
        wakeY: window.innerHeight * 0.2,
        wakeTargetX: window.innerWidth * 0.5,
        wakeTargetY: window.innerHeight * 0.2,
        wakeAlpha: 0.012,
        wakeTargetAlpha: 0.012,
        wakeRadius: 760,
        wakeTargetRadius: 760,
        cornerTL: 0.011,
        cornerTR: 0.011,
        cornerBR: 0.011,
        cornerBL: 0.011,
        cornerTargetTL: 0.011,
        cornerTargetTR: 0.011,
        cornerTargetBR: 0.011,
        cornerTargetBL: 0.011,
        hasInputSample: false,
        lastMotionAt: performance.now(),
    };
    const positionEase = 0.052;
    const focusInEase = 0.046;
    const focusOutEase = 0.006;
    const flowEase = 0.065;
    const speedInEase = 0.1;
    const speedOutEase = 0.022;
    const cornerChargeInEase = 0.055;
    const cornerChargeOutEase = 0.012;
    const wakeFollowEase = 0.052;
    const wakeAlphaInEase = 0.06;
    const wakeAlphaOutEase = 0.02;
    const wakeRadiusInEase = 0.055;
    const wakeRadiusOutEase = 0.02;
    const scatterDelay = 620;
    const focusEpsilon = 0.002;
    const speedEpsilon = 0.004;
    const settleEpsilon = 0.18;
    let rafId = 0;
    let isAnimating = false;

    const lerp = (from, to, progress) => from + (to - from) * progress;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const isHiContrast = () => document.documentElement.getAttribute("data-contrast") === "hicontrast";

    const preservePigment = (baseAlpha, baseRadius, currentRadius, minAlpha, maxAlpha) => {
        const conserved = baseAlpha * baseRadius * baseRadius;
        return clamp(conserved / (currentRadius * currentRadius), minAlpha, maxAlpha);
    };

    const updateCornerTargets = (gather) => {
        const viewportW = Math.max(window.innerWidth, 1);
        const viewportH = Math.max(window.innerHeight, 1);
        const diagonal = Math.hypot(viewportW, viewportH);
        const cornerProximity = (cornerX, cornerY) =>
            1 - clamp(Math.hypot(glowState.currentX - cornerX, glowState.currentY - cornerY) / diagonal, 0, 1);
        const speedFactor = clamp(glowState.currentSpeed, 0, 1);
        const extraction = Math.pow(gather, 1.26);
        const baseCharge = lerp(0.016, 0.0032, extraction);
        const cornerLift = 0.007 + extraction * 0.02 + speedFactor * 0.016;

        glowState.cornerTargetTL = clamp(baseCharge + cornerProximity(0, 0) * cornerLift, 0.003, 0.058);
        glowState.cornerTargetTR = clamp(baseCharge + cornerProximity(viewportW, 0) * cornerLift, 0.003, 0.058);
        glowState.cornerTargetBR = clamp(
            baseCharge + cornerProximity(viewportW, viewportH) * cornerLift,
            0.003,
            0.058,
        );
        glowState.cornerTargetBL = clamp(baseCharge + cornerProximity(0, viewportH) * cornerLift, 0.003, 0.058);
    };

    const stepCornerCharges = () => {
        const stepCorner = (current, target) => {
            const ease = target > current ? cornerChargeInEase : cornerChargeOutEase;
            return current + (target - current) * ease;
        };
        glowState.cornerTL = stepCorner(glowState.cornerTL, glowState.cornerTargetTL);
        glowState.cornerTR = stepCorner(glowState.cornerTR, glowState.cornerTargetTR);
        glowState.cornerBR = stepCorner(glowState.cornerBR, glowState.cornerTargetBR);
        glowState.cornerBL = stepCorner(glowState.cornerBL, glowState.cornerTargetBL);
    };

    const stepWakeShadow = (gather, speed) => {
        const lagDistance = lerp(340, 140, gather) + speed * 210;
        glowState.wakeTargetX = glowState.currentX - glowState.dirX * lagDistance;
        glowState.wakeTargetY = glowState.currentY - glowState.dirY * lagDistance;
        glowState.wakeX += (glowState.wakeTargetX - glowState.wakeX) * wakeFollowEase;
        glowState.wakeY += (glowState.wakeTargetY - glowState.wakeY) * wakeFollowEase;

        glowState.wakeTargetAlpha = lerp(0.012, 0.055, gather) + speed * 0.016;
        glowState.wakeTargetRadius = lerp(860, 520, gather) + speed * 170;

        const alphaEase = glowState.wakeTargetAlpha > glowState.wakeAlpha ? wakeAlphaInEase : wakeAlphaOutEase;
        glowState.wakeAlpha += (glowState.wakeTargetAlpha - glowState.wakeAlpha) * alphaEase;

        const radiusEase = glowState.wakeTargetRadius < glowState.wakeRadius ? wakeRadiusInEase : wakeRadiusOutEase;
        glowState.wakeRadius += (glowState.wakeTargetRadius - glowState.wakeRadius) * radiusEase;
    };

    const setGlow = (x, y, focus, flowX, flowY, speed, now = performance.now()) => {
        const clampedFocus = clamp(focus, 0, 1);
        const clampedSpeed = clamp(speed, 0, 1.45);
        const gather = clamp(clampedFocus * 0.72 + clampedSpeed * 0.28, 0, 1);
        const extraction = Math.pow(gather, 1.18);
        const breathWave = Math.sin(now * 0.00145 + gather * 1.28);
        const breathAmplitude = lerp(0.018, 0.17, gather);
        const breathLift = breathWave * breathAmplitude;
        const flowLength = Math.hypot(flowX, flowY);
        if (flowLength > 0.0001) {
            glowState.dirX = flowX / flowLength;
            glowState.dirY = flowY / flowLength;
        }
        const dirX = glowState.dirX;
        const dirY = glowState.dirY;
        const sideX = -dirY;
        const sideY = dirX;

        const coreRadius = lerp(1320, 320, gather);
        const haloRadius = lerp(1680, 590, gather);
        const coreAlphaBase = preservePigment(0.062, 1320, coreRadius, 0.01, 0.24);
        const haloAlphaBase = preservePigment(0.048, 1680, haloRadius, 0.008, 0.16);
        const coreAlpha = clamp(coreAlphaBase * lerp(0.1, 1.18, gather) * (1 + breathLift), 0.006, 0.27);
        const haloAlpha = clamp(
            haloAlphaBase * lerp(0.16, 1.08, gather) * (1 + breathLift * 0.68),
            0.004,
            0.185,
        );
        const ambientAlpha = clamp(lerp(0.054, 0.0042, extraction) * (1 - breathLift * 0.88), 0.0024, 0.068);
        const ambientVignetteAlpha = clamp(
            lerp(0.028, 0.0048, extraction) * (1 - breathLift * 0.62),
            0.0028,
            0.036,
        );

        const trailDistance = lerp(250, 80, gather) + clampedSpeed * 92;
        const wingDistance = lerp(162, 56, gather) + clampedSpeed * 46;
        const wingBackPull = trailDistance * 0.35;

        const trailX = x - dirX * trailDistance;
        const trailY = y - dirY * trailDistance;
        const wingLeftX = x + sideX * wingDistance - dirX * wingBackPull;
        const wingLeftY = y + sideY * wingDistance - dirY * wingBackPull;
        const wingRightX = x - sideX * wingDistance - dirX * wingBackPull;
        const wingRightY = y - sideY * wingDistance - dirY * wingBackPull;

        const trailRadius = lerp(640, 210, gather) + clampedSpeed * 120;
        const wingRadius = lerp(480, 170, gather) + clampedSpeed * 74;
        const trailAlphaBase = preservePigment(0.041, 560, trailRadius, 0.016, 0.12);
        const wingAlphaBase = preservePigment(0.032, 430, wingRadius, 0.012, 0.09);
        const trailAlpha = clamp(trailAlphaBase * lerp(0, 1.34, gather) * (1 + breathLift * 0.52), 0, 0.15);
        const wingAlpha = clamp(wingAlphaBase * lerp(0, 1.15, gather) * (1 + breathLift * 0.46), 0, 0.11);

        rootStyle.setProperty("--glow-x", `${x}px`);
        rootStyle.setProperty("--glow-y", `${y}px`);
        rootStyle.setProperty("--glow-focus", clampedFocus.toFixed(4));
        rootStyle.setProperty("--glow-speed", clampedSpeed.toFixed(4));
        rootStyle.setProperty("--glow-gather", gather.toFixed(4));
        rootStyle.setProperty("--glow-ambient-alpha", ambientAlpha.toFixed(4));
        rootStyle.setProperty("--glow-ambient-vignette-alpha", ambientVignetteAlpha.toFixed(4));
        rootStyle.setProperty("--glow-wake-x", `${glowState.wakeX.toFixed(1)}px`);
        rootStyle.setProperty("--glow-wake-y", `${glowState.wakeY.toFixed(1)}px`);
        rootStyle.setProperty("--glow-wake-alpha", glowState.wakeAlpha.toFixed(4));
        rootStyle.setProperty("--glow-wake-radius", `${glowState.wakeRadius.toFixed(1)}px`);
        rootStyle.setProperty("--glow-core-radius", `${coreRadius.toFixed(1)}px`);
        rootStyle.setProperty("--glow-halo-radius", `${haloRadius.toFixed(1)}px`);
        rootStyle.setProperty("--glow-core-alpha", coreAlpha.toFixed(4));
        rootStyle.setProperty("--glow-halo-alpha", haloAlpha.toFixed(4));
        rootStyle.setProperty("--glow-trail-x", `${trailX.toFixed(1)}px`);
        rootStyle.setProperty("--glow-trail-y", `${trailY.toFixed(1)}px`);
        rootStyle.setProperty("--glow-trail-radius", `${trailRadius.toFixed(1)}px`);
        rootStyle.setProperty("--glow-trail-alpha", trailAlpha.toFixed(4));
        rootStyle.setProperty("--glow-wing-left-x", `${wingLeftX.toFixed(1)}px`);
        rootStyle.setProperty("--glow-wing-left-y", `${wingLeftY.toFixed(1)}px`);
        rootStyle.setProperty("--glow-wing-right-x", `${wingRightX.toFixed(1)}px`);
        rootStyle.setProperty("--glow-wing-right-y", `${wingRightY.toFixed(1)}px`);
        rootStyle.setProperty("--glow-wing-radius", `${wingRadius.toFixed(1)}px`);
        rootStyle.setProperty("--glow-wing-alpha", wingAlpha.toFixed(4));
        rootStyle.setProperty("--glow-corner-tl-alpha", glowState.cornerTL.toFixed(4));
        rootStyle.setProperty("--glow-corner-tr-alpha", glowState.cornerTR.toFixed(4));
        rootStyle.setProperty("--glow-corner-br-alpha", glowState.cornerBR.toFixed(4));
        rootStyle.setProperty("--glow-corner-bl-alpha", glowState.cornerBL.toFixed(4));
    };

    const centerGlow = () => {
        glowState.currentX = window.innerWidth * 0.5;
        glowState.currentY = window.innerHeight * 0.2;
        glowState.targetX = glowState.currentX;
        glowState.targetY = glowState.currentY;
        glowState.lastInputX = glowState.currentX;
        glowState.lastInputY = glowState.currentY;
        glowState.currentFocus = 0;
        glowState.targetFocus = 0;
        glowState.currentFlowX = 0;
        glowState.currentFlowY = 0;
        glowState.targetFlowX = 0;
        glowState.targetFlowY = 0;
        glowState.currentSpeed = 0;
        glowState.targetSpeed = 0;
        glowState.dirX = 0;
        glowState.dirY = -1;
        glowState.wakeX = glowState.currentX;
        glowState.wakeY = glowState.currentY;
        glowState.wakeTargetX = glowState.currentX;
        glowState.wakeTargetY = glowState.currentY;
        glowState.wakeAlpha = 0.012;
        glowState.wakeTargetAlpha = 0.012;
        glowState.wakeRadius = 760;
        glowState.wakeTargetRadius = 760;
        glowState.cornerTL = 0.011;
        glowState.cornerTR = 0.011;
        glowState.cornerBR = 0.011;
        glowState.cornerBL = 0.011;
        glowState.cornerTargetTL = 0.011;
        glowState.cornerTargetTR = 0.011;
        glowState.cornerTargetBR = 0.011;
        glowState.cornerTargetBL = 0.011;
        setGlow(
            glowState.currentX,
            glowState.currentY,
            glowState.currentFocus,
            glowState.currentFlowX,
            glowState.currentFlowY,
            glowState.currentSpeed,
            performance.now(),
        );
    };

    const refreshFocusTarget = (now) => {
        const elapsed = now - glowState.lastMotionAt;
        const normalized = clamp(1 - elapsed / scatterDelay, 0, 1);
        const decayFocus = Math.pow(normalized, 1.25);
        const speedDrivenFocus = clamp(glowState.targetSpeed * 0.52, 0, 1);
        glowState.targetFocus = Math.max(decayFocus, speedDrivenFocus);
    };

    const animateGlow = (now) => {
        refreshFocusTarget(now);

        if (glowState.targetFocus < 0.5) {
            glowState.targetSpeed *= 0.965;
            glowState.targetFlowX *= 0.97;
            glowState.targetFlowY *= 0.97;
        }

        const focusEase = glowState.targetFocus > glowState.currentFocus ? focusInEase : focusOutEase;
        glowState.currentFocus += (glowState.targetFocus - glowState.currentFocus) * focusEase;

        const speedEase = glowState.targetSpeed > glowState.currentSpeed ? speedInEase : speedOutEase;
        glowState.currentSpeed += (glowState.targetSpeed - glowState.currentSpeed) * speedEase;

        glowState.currentFlowX += (glowState.targetFlowX - glowState.currentFlowX) * flowEase;
        glowState.currentFlowY += (glowState.targetFlowY - glowState.currentFlowY) * flowEase;

        const motionFactor = clamp(glowState.currentFocus * 0.82 + glowState.currentSpeed * 0.42, 0, 1);
        const adaptivePositionEase = lerp(positionEase * 0.55, positionEase * 1.05, motionFactor);
        glowState.currentX += (glowState.targetX - glowState.currentX) * adaptivePositionEase;
        glowState.currentY += (glowState.targetY - glowState.currentY) * adaptivePositionEase;
        stepWakeShadow(motionFactor, glowState.currentSpeed);
        updateCornerTargets(motionFactor);
        stepCornerCharges();
        setGlow(
            glowState.currentX,
            glowState.currentY,
            glowState.currentFocus,
            glowState.currentFlowX,
            glowState.currentFlowY,
            glowState.currentSpeed,
            now,
        );

        const deltaX = Math.abs(glowState.targetX - glowState.currentX);
        const deltaY = Math.abs(glowState.targetY - glowState.currentY);
        const focusDelta = Math.abs(glowState.targetFocus - glowState.currentFocus);
        const flowDelta = Math.hypot(
            glowState.targetFlowX - glowState.currentFlowX,
            glowState.targetFlowY - glowState.currentFlowY,
        );
        const speedDelta = Math.abs(glowState.targetSpeed - glowState.currentSpeed);
        const cornerDelta =
            Math.abs(glowState.cornerTargetTL - glowState.cornerTL) +
            Math.abs(glowState.cornerTargetTR - glowState.cornerTR) +
            Math.abs(glowState.cornerTargetBR - glowState.cornerBR) +
            Math.abs(glowState.cornerTargetBL - glowState.cornerBL);
        const wakeDelta =
            Math.abs(glowState.wakeTargetX - glowState.wakeX) +
            Math.abs(glowState.wakeTargetY - glowState.wakeY) +
            Math.abs(glowState.wakeTargetAlpha - glowState.wakeAlpha) +
            Math.abs(glowState.wakeTargetRadius - glowState.wakeRadius);
        const shouldContinue =
            deltaX > settleEpsilon ||
            deltaY > settleEpsilon ||
            focusDelta > focusEpsilon ||
            glowState.currentFocus > focusEpsilon ||
            flowDelta > focusEpsilon ||
            speedDelta > speedEpsilon ||
            glowState.currentSpeed > speedEpsilon ||
            cornerDelta > 0.0035 ||
            wakeDelta > 0.55;

        if (shouldContinue) {
            rafId = requestAnimationFrame(animateGlow);
        } else {
            rafId = 0;
            isAnimating = false;
        }
    };

    const ensureAnimation = () => {
        if (isAnimating) return;
        isAnimating = true;
        rafId = requestAnimationFrame(animateGlow);
    };

    const stopAnimation = () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
        isAnimating = false;
    };

    centerGlow();

    const disperseToAmbient = (recenter = false) => {
        glowState.lastMotionAt = 0;
        glowState.targetSpeed = 0;
        glowState.targetFlowX = 0;
        glowState.targetFlowY = 0;
        if (recenter) {
            glowState.targetX = window.innerWidth * 0.5;
            glowState.targetY = window.innerHeight * 0.2;
            glowState.hasInputSample = false;
        }
        ensureAnimation();
    };

    const syncGlowTarget = (x, y) => {
        if (isHiContrast()) return;

        if (!glowState.hasInputSample) {
            glowState.lastInputX = x;
            glowState.lastInputY = y;
            glowState.targetX = x;
            glowState.targetY = y;
            glowState.targetSpeed = Math.min(glowState.targetSpeed, 0.06);
            glowState.lastMotionAt = performance.now();
            glowState.hasInputSample = true;
            ensureAnimation();
            return;
        }

        const motionX = x - glowState.lastInputX;
        const motionY = y - glowState.lastInputY;
        const motionDistance = Math.hypot(motionX, motionY);
        if (motionDistance > 0.01) {
            glowState.targetFlowX = motionX / motionDistance;
            glowState.targetFlowY = motionY / motionDistance;
            const normalized = clamp(motionDistance / 110, 0, 1.6);
            const sampledSpeed = Math.pow(normalized, 1.38);
            glowState.targetSpeed += (sampledSpeed - glowState.targetSpeed) * 0.24;
            glowState.targetSpeed = clamp(glowState.targetSpeed, 0, 1.45);
        }

        glowState.lastInputX = x;
        glowState.lastInputY = y;
        glowState.targetX = x;
        glowState.targetY = y;
        glowState.lastMotionAt = performance.now();
        ensureAnimation();
    };

    const updateFromPointer = (event) => {
        if (event.pointerType === "touch") return;
        syncGlowTarget(event.clientX, event.clientY);
    };

    const updateFromTouch = (event) => {
        const touch = event.touches[0];
        if (touch) syncGlowTarget(touch.clientX, touch.clientY);
    };

    const hideIfMouseLeftViewport = (event) => {
        if (event.relatedTarget || event.toElement) return;
        disperseToAmbient(true);
    };

    window.addEventListener("pointermove", updateFromPointer, { passive: true });
    window.addEventListener(
        "pointerenter",
        (event) => {
            if (event.pointerType === "touch") return;
            syncGlowTarget(event.clientX, event.clientY);
            glowState.targetSpeed = Math.max(glowState.targetSpeed, 0.1);
        },
        { passive: true },
    );
    window.addEventListener("touchmove", updateFromTouch, { passive: true });
    window.addEventListener(
        "resize",
        () => {
            centerGlow();
            stopAnimation();
        },
        { passive: true },
    );
    window.addEventListener("touchstart", updateFromTouch, { passive: true });
    window.addEventListener(
        "touchend",
        () => {
            disperseToAmbient(false);
        },
        { passive: true },
    );
    window.addEventListener(
        "touchcancel",
        () => {
            disperseToAmbient(false);
        },
        { passive: true },
    );
    document.addEventListener("mouseout", hideIfMouseLeftViewport, true);
    window.addEventListener(
        "blur",
        () => {
            disperseToAmbient(true);
        },
        { passive: true },
    );
    window.addEventListener(
        "pointerleave",
        () => {
            disperseToAmbient(true);
        },
        { passive: true },
    );
    window.addEventListener(
        "modern:contrast-change",
        () => {
            if (isHiContrast()) {
                centerGlow();
                stopAnimation();
            }
        },
        { passive: true },
    );
})();
