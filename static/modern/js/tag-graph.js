(() => {
    const canvas = document.getElementById("tagGraphCanvas");
    if (!canvas) return;

    const chips = Array.from(document.querySelectorAll(".tag-grid .tag-chip"));
    if (!chips.length) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const getLabel = (chip) => {
        for (const node of chip.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) return text;
            }
        }
        return chip.textContent.trim();
    };

    const tags = chips
        .map((chip) => {
            const count = Number.parseInt(chip.querySelector("span")?.textContent ?? "1", 10) || 1;
            return {
                label: getLabel(chip),
                count,
                href: chip.getAttribute("href") || "#",
            };
        })
        .sort((left, right) => right.count - left.count)
        .slice(0, 60);

    if (!tags.length) return;

    const maxCount = Math.max(...tags.map((tag) => tag.count));
    const minCount = Math.min(...tags.map((tag) => tag.count));
    const countSpan = Math.max(1, maxCount - minCount);

    let width = 0;
    let height = 0;
    const pointer = {
        x: -1_000,
        y: -1_000,
    };
    const dragState = {
        node: null,
        moved: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        lastTime: 0,
    };
    let hoveredNode = null;
    let tick = 0;

    const edgeSet = new Set();
    const edges = [];
    const addEdge = (a, b) => {
        if (a === b) return;
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (edgeSet.has(key)) return;
        edgeSet.add(key);
        edges.push({ a, b });
    };

    for (let index = 0; index < tags.length - 1; index += 1) {
        addEdge(index, index + 1);
    }
    for (let index = 0; index < tags.length; index += 1) {
        const hop = index < 6 ? 3 : 2;
        if (index + hop < tags.length) addEdge(index, index + hop);
    }
    for (let index = 1; index < Math.min(tags.length, 10); index += 1) {
        addEdge(0, index);
    }

    const nodes = tags.map((tag, index) => {
        const ratio = (tag.count - minCount) / countSpan;
        return {
            ...tag,
            index,
            ratio,
            radius: 7 + ratio * 15,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            orbit: 0,
            phase: index * 0.53 + Math.random() * 0.45,
        };
    });

    const resetNodes = () => {
        const centerX = width / 2;
        const centerY = height / 2;
        const major = Math.max(60, Math.min(width, height) * 0.32);

        nodes.forEach((node, index) => {
            const angle = (Math.PI * 2 * index) / nodes.length;
            node.orbit = major * (0.38 + node.ratio * 0.78) + (index % 4) * 16;
            node.x = centerX + Math.cos(angle) * node.orbit * 0.62 + (Math.random() - 0.5) * 26;
            node.y = centerY + Math.sin(angle) * node.orbit * 0.38 + (Math.random() - 0.5) * 20;
            node.vx = (Math.random() - 0.5) * 0.9;
            node.vy = (Math.random() - 0.5) * 0.9;
        });
    };

    const setPointerFromEvent = (event) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
    };

    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.clientWidth || 1_200;
        height = canvas.clientHeight || 360;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        resetNodes();
    };

    const palette = () => {
        const root = getComputedStyle(document.documentElement);
        const accentRgb = root.getPropertyValue("--accent-rgb").trim() || "32, 94, 166";
        const text = root.getPropertyValue("--ink-900").trim() || "#100f0f";
        const muted = root.getPropertyValue("--ink-500").trim() || "#6f6e69";
        return {
            edge: `rgba(${accentRgb}, 0.18)`,
            edgeStrong: `rgba(${accentRgb}, 0.35)`,
            nodeFill: `rgba(${accentRgb}, 0.2)`,
            nodeFillStrong: `rgba(${accentRgb}, 0.42)`,
            nodeStroke: `rgba(${accentRgb}, 0.78)`,
            text,
            muted,
        };
    };

    const step = () => {
        tick += 1;
        const centerX = width / 2;
        const centerY = height / 2;
        const time = tick / 180;
        const draggingNode = dragState.node;

        for (const node of nodes) {
            if (draggingNode && draggingNode.index === node.index) {
                node.vx = node.vx * 0.7 + (pointer.x - node.x) * 0.22;
                node.vy = node.vy * 0.7 + (pointer.y - node.y) * 0.22;
                continue;
            }
            const orbitX = Math.cos(node.phase + time) * node.orbit * 0.62;
            const orbitY = Math.sin(node.phase + time * 1.2) * node.orbit * 0.38;
            const targetX = centerX + orbitX;
            const targetY = centerY + orbitY;
            node.vx += (targetX - node.x) * 0.0025;
            node.vy += (targetY - node.y) * 0.0025;
        }

        for (let left = 0; left < nodes.length; left += 1) {
            for (let right = left + 1; right < nodes.length; right += 1) {
                const a = nodes[left];
                const b = nodes[right];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distSq = dx * dx + dy * dy + 0.001;
                const dist = Math.sqrt(distSq);
                const minDist = a.radius + b.radius + 14;
                if (dist > minDist) continue;
                const force = (minDist - dist) * 0.014;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
            }
        }

        for (const edge of edges) {
            const a = nodes[edge.a];
            const b = nodes[edge.b];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 1;
            const targetDist = 58 + (a.radius + b.radius) * 1.6;
            const force = (dist - targetDist) * 0.0022;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
        }

        for (const node of nodes) {
            node.vx *= 0.92;
            node.vy *= 0.92;
            node.x += node.vx;
            node.y += node.vy;

            const minX = node.radius + 8;
            const maxX = width - node.radius - 8;
            const minY = node.radius + 8;
            const maxY = height - node.radius - 8;
            if (node.x < minX) {
                node.x = minX;
                node.vx *= -0.4;
            } else if (node.x > maxX) {
                node.x = maxX;
                node.vx *= -0.4;
            }
            if (node.y < minY) {
                node.y = minY;
                node.vy *= -0.4;
            } else if (node.y > maxY) {
                node.y = maxY;
                node.vy *= -0.4;
            }
        }
    };

    const pickNode = () => {
        hoveredNode = null;
        for (let index = nodes.length - 1; index >= 0; index -= 1) {
            const node = nodes[index];
            const dx = pointer.x - node.x;
            const dy = pointer.y - node.y;
            if (dx * dx + dy * dy <= (node.radius + 4) ** 2) {
                hoveredNode = node;
                return;
            }
        }
    };

    const render = () => {
        const colors = palette();
        const focusedNode = dragState.node || hoveredNode;
        context.clearRect(0, 0, width, height);

        context.lineWidth = 1;
        for (const edge of edges) {
            const a = nodes[edge.a];
            const b = nodes[edge.b];
            const highlighted = focusedNode && (focusedNode.index === a.index || focusedNode.index === b.index);
            context.strokeStyle = highlighted ? colors.edgeStrong : colors.edge;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
        }

        for (const node of nodes) {
            const highlighted = focusedNode && focusedNode.index === node.index;
            context.fillStyle = highlighted ? colors.nodeFillStrong : colors.nodeFill;
            context.strokeStyle = colors.nodeStroke;
            context.lineWidth = highlighted ? 1.6 : 1.1;
            context.beginPath();
            context.arc(node.x, node.y, node.radius + (highlighted ? 1.4 : 0), 0, Math.PI * 2);
            context.fill();
            context.stroke();
        }

        context.textAlign = "center";
        context.textBaseline = "middle";
        for (const node of nodes) {
            const highlighted = focusedNode && focusedNode.index === node.index;
            context.fillStyle = highlighted ? colors.text : colors.muted;
            context.font = highlighted ? "700 0.9rem Newsreader, serif" : "600 0.8rem Newsreader, serif";
            context.fillText(node.label, node.x, node.y - node.radius - 12);
        }

        if (dragState.node) {
            canvas.style.cursor = "grabbing";
        } else {
            canvas.style.cursor = hoveredNode ? "grab" : "default";
        }
    };

    const animate = () => {
        step();
        pickNode();
        render();
        window.requestAnimationFrame(animate);
    };

    const endDrag = (event) => {
        if (event) setPointerFromEvent(event);
        const shouldNavigate = dragState.node && !dragState.moved && hoveredNode && hoveredNode.href;
        dragState.node = null;
        dragState.lastTime = 0;
        if (shouldNavigate) {
            window.location.href = hoveredNode.href;
        }
    };

    canvas.addEventListener("pointerdown", (event) => {
        setPointerFromEvent(event);
        pickNode();
        if (!hoveredNode) return;
        dragState.node = hoveredNode;
        dragState.moved = false;
        dragState.startX = pointer.x;
        dragState.startY = pointer.y;
        dragState.lastX = pointer.x;
        dragState.lastY = pointer.y;
        dragState.lastTime = performance.now();
        dragState.node.vx = 0;
        dragState.node.vy = 0;
        if (canvas.setPointerCapture) {
            canvas.setPointerCapture(event.pointerId);
        }
        event.preventDefault();
    });

    canvas.addEventListener("pointermove", (event) => {
        setPointerFromEvent(event);
        if (!dragState.node) return;
        const now = performance.now();
        const dt = Math.max(8, now - dragState.lastTime);
        const dx = pointer.x - dragState.lastX;
        const dy = pointer.y - dragState.lastY;
        dragState.node.vx = dragState.node.vx * 0.5 + (dx / dt) * 14;
        dragState.node.vy = dragState.node.vy * 0.5 + (dy / dt) * 14;
        dragState.lastX = pointer.x;
        dragState.lastY = pointer.y;
        dragState.lastTime = now;
        if (!dragState.moved) {
            const totalDx = pointer.x - dragState.startX;
            const totalDy = pointer.y - dragState.startY;
            dragState.moved = totalDx * totalDx + totalDy * totalDy > 20;
        }
        event.preventDefault();
    });

    canvas.addEventListener("pointerup", (event) => {
        endDrag(event);
    });

    canvas.addEventListener("pointercancel", (event) => {
        endDrag(event);
    });

    canvas.addEventListener("pointerleave", () => {
        if (!dragState.node) {
            pointer.x = -1_000;
            pointer.y = -1_000;
        }
    });

    canvas.style.touchAction = "none";

    window.addEventListener("resize", resizeCanvas, { passive: true });

    const modeObserver = new MutationObserver(() => {
        render();
    });
    modeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-mode", "data-accent"],
    });

    resizeCanvas();
    animate();
})();
