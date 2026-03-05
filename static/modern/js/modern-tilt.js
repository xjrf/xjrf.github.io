(() => {
    const cards = Array.from(document.querySelectorAll("[data-press-tilt]"));
    if (!cards.length) return;

    const releaseCard = (card) => {
        card.classList.remove("is-pressing");
        card.classList.remove("is-tilting");
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");
    };

    const tiltCard = (card, clientX, clientY) => {
        const rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;

        const rotateY = (px - 0.5) * 7.2;
        const rotateX = (0.5 - py) * 7.2;

        card.style.setProperty("--tilt-rx", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-ry", `${rotateY.toFixed(2)}deg`);
        card.classList.add("is-tilting");
    };

    cards.forEach((card) => {
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");

        card.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            card.classList.add("is-pressing");
            tiltCard(card, event.clientX, event.clientY);
            if (card.setPointerCapture) {
                card.setPointerCapture(event.pointerId);
            }
        });

        card.addEventListener("pointermove", (event) => {
            if (!card.classList.contains("is-pressing")) return;
            tiltCard(card, event.clientX, event.clientY);
        });

        card.addEventListener("pointerup", () => {
            releaseCard(card);
        });

        card.addEventListener("pointercancel", () => {
            releaseCard(card);
        });

        card.addEventListener("mouseleave", () => {
            if (!card.classList.contains("is-pressing")) {
                releaseCard(card);
            }
        });

        card.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });
    });

    window.addEventListener(
        "blur",
        () => {
            cards.forEach((card) => releaseCard(card));
        },
        { passive: true },
    );
})();
