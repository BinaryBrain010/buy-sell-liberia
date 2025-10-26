"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Point = { x: number; y: number };

const COLS = 20;
const ROWS = 20;
const CELL = 18; // px per cell
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;

function randCell(): Point {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS),
  };
}

function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const snakeRef = useRef<Point[]>([
    { x: 8, y: 10 },
    { x: 9, y: 10 },
    { x: 10, y: 10 },
  ]);
  const foodRef = useRef<Point>(randCell());
  const tickMsRef = useRef(120);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameOverRef = useRef(false);

  // Theme-aware colors
  type Palette = {
    bg: string;
    grid: string;
    food: string;
    snakeHead: string;
    snakeBody1: string;
    snakeBody2: string;
    snakeStroke: string;
  };
  const colorsRef = useRef<Palette | null>(null);

  const readCssVar = (name: string): string | null => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return v ? v : null;
  };
  const hslVar = (name: string, alpha?: number, fallback?: string): string => {
    const v = readCssVar(name);
    if (v)
      return typeof alpha === "number" ? `hsl(${v} / ${alpha})` : `hsl(${v})`;
    return fallback || "#000";
  };
  const computePalette = (): Palette => {
    const bg = hslVar("--background", undefined, "#0b0b0b");
    const mutedFg = hslVar(
      "--muted-foreground",
      0.12,
      "rgba(127,127,127,0.12)"
    );
    const primary = hslVar("--primary", undefined, "#22c55e");
    const primarySoft = hslVar("--primary", 0.85, "#16a34a");
    const primarySofter = hslVar("--primary", 0.7, "#15803d");
    const accent = hslVar("--accent", undefined, "#f59e0b");
    const destructive = hslVar("--destructive", undefined, "#ef4444");
    return {
      bg,
      grid: mutedFg,
      food: destructive || accent,
      snakeHead: primary,
      snakeBody1: primarySoft,
      snakeBody2: primarySofter,
      snakeStroke: hslVar("--foreground", 0.15, "rgba(0,0,0,0.15)"),
    };
  };

  // Initialize and react to theme changes (class changes on <html>)
  useEffect(() => {
    colorsRef.current = computePalette();
    const observer = new MutationObserver(() => {
      colorsRef.current = computePalette();
      draw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load best score
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem("snake_best") || 0);
      if (!Number.isNaN(v)) setBest(v);
    } catch {}
  }, []);

  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      const { x, y } = dirRef.current;
      const isControlKey =
        [
          "arrowup",
          "w",
          "arrowdown",
          "s",
          "arrowleft",
          "a",
          "arrowright",
          "d",
        ].includes(k) ||
        k === " " ||
        k === "spacebar";
      if (isControlKey) {
        // Prevent page scroll when using game keys
        e.preventDefault();
      }
      if (["arrowup", "w"].includes(k) && y !== 1)
        nextDirRef.current = { x: 0, y: -1 };
      else if (["arrowdown", "s"].includes(k) && y !== -1)
        nextDirRef.current = { x: 0, y: 1 };
      else if (["arrowleft", "a"].includes(k) && x !== 1)
        nextDirRef.current = { x: -1, y: 0 };
      else if (["arrowright", "d"].includes(k) && x !== -1)
        nextDirRef.current = { x: 1, y: 0 };
      else if (k === " " || k === "spacebar") {
        // Space to pause/resume or restart on game over
        if (gameOverRef.current) restart();
        else setRunning((r) => !r);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function draw() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const palette = colorsRef.current || computePalette();

    // Background
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Grid (subtle)
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(WIDTH, y * CELL + 0.5);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = palette.food;
    const fx = foodRef.current.x * CELL;
    const fy = foodRef.current.y * CELL;
    ctx.beginPath();
    ctx.roundRect?.(fx + 2, fy + 2, CELL - 4, CELL - 4, 4);
    if (!ctx.roundRect) ctx.fillRect(fx + 2, fy + 2, CELL - 4, CELL - 4);
    ctx.fill();

    // Snake
    const snake = snakeRef.current;
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const isHead = i === snake.length - 1;
      ctx.fillStyle = isHead
        ? palette.snakeHead
        : i % 2 === 0
        ? palette.snakeBody1
        : palette.snakeBody2;
      const x = seg.x * CELL;
      const y = seg.y * CELL;
      // rounded rect for nicer look
      ctx.beginPath();
      ctx.roundRect?.(x + 1, y + 1, CELL - 2, CELL - 2, 3);
      if (!ctx.roundRect) ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.fill();
      // subtle stroke for depth
      ctx.strokeStyle = palette.snakeStroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Game over overlay
    if (gameOverRef.current) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = hslVar("--foreground", undefined, "#fff");
      ctx.font = "bold 18px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.textAlign = "center";
      ctx.fillText("Game Over — press Space to restart", WIDTH / 2, HEIGHT / 2);
    }
  }

  function step() {
    // Commit direction changes once per tick
    dirRef.current = nextDirRef.current;
    const dir = dirRef.current;
    const snake = snakeRef.current.slice();
    const head = snake[snake.length - 1];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // Collisions: walls
    if (
      newHead.x < 0 ||
      newHead.x >= COLS ||
      newHead.y < 0 ||
      newHead.y >= ROWS
    ) {
      return gameOver();
    }
    // Collisions: self
    if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      return gameOver();
    }

    snake.push(newHead);
    // Eat food
    if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
      setScore((s) => s + 1);
      // Increase speed slightly (cap minimum interval)
      tickMsRef.current = Math.max(70, tickMsRef.current - 2);
      // Place new food not on snake
      let f = randCell();
      while (snake.some((s) => s.x === f.x && s.y === f.y)) f = randCell();
      foodRef.current = f;
    } else {
      snake.shift(); // move forward
    }
    snakeRef.current = snake;
    draw();
  }

  function start() {
    if (running) return;
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function restart() {
    gameOverRef.current = false;
    snakeRef.current = [
      { x: 8, y: 10 },
      { x: 9, y: 10 },
      { x: 10, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randCell();
    tickMsRef.current = 120;
    setScore(0);
    setRunning(true);
    draw();
  }

  function gameOver() {
    gameOverRef.current = true;
    setRunning(false);
    setBest((b) => {
      const nb = Math.max(b, score);
      try {
        localStorage.setItem("snake_best", String(nb));
      } catch {}
      return nb;
    });
    draw();
  }

  // Interval loop
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    // new interval with current tick speed
    intervalRef.current = setInterval(() => step(), tickMsRef.current);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // Intentionally not depending on tickMsRef to avoid constant resets; it is read each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Initial draw
  useEffect(() => {
    draw();
  }, []);

  const setDir = (d: Point) => {
    const cur = dirRef.current;
    if (d.x === -cur.x && d.y === -cur.y) return; // prevent reversing
    nextDirRef.current = d;
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold">We’ll be back soon</h1>
        <p className="text-sm text-muted-foreground">
          Site is under maintenance. Enjoy a quick game meanwhile!
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            Score: <span className="font-medium">{score}</span>
          </div>
          <div className="text-sm text-muted-foreground">Best: {best}</div>
        </div>
        <div className="mt-3 grid place-items-center">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="rounded-md border"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {!running ? (
            <button
              onClick={gameOverRef.current ? restart : start}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              {gameOverRef.current ? "Restart" : "Start"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="rounded-md border px-4 py-2 hover:bg-accent"
            >
              Pause
            </button>
          )}
          <div className="ml-2 hidden gap-2 sm:flex">
            <button
              className="rounded-md border px-3 py-2 hover:bg-accent"
              onClick={() => setDir({ x: 0, y: -1 })}
            >
              ↑
            </button>
            <button
              className="rounded-md border px-3 py-2 hover:bg-accent"
              onClick={() => setDir({ x: -1, y: 0 })}
            >
              ←
            </button>
            <button
              className="rounded-md border px-3 py-2 hover:bg-accent"
              onClick={() => setDir({ x: 1, y: 0 })}
            >
              →
            </button>
            <button
              className="rounded-md border px-3 py-2 hover:bg-accent"
              onClick={() => setDir({ x: 0, y: 1 })}
            >
              ↓
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Use Arrow keys / WASD. Space to pause. Don’t hit the walls—or
          yourself!
        </p>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const [open, setOpen] = useState(false);
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="mx-auto w-full max-w-xl text-center">
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">
          We’ll be back soon
        </h1>
        <p className="text-muted-foreground mb-6">
          Our site is temporarily down for maintenance. We’re working hard to
          bring everything back online as quickly as possible.
        </p>
        <div className="rounded-lg border p-4 bg-card text-card-foreground">
          <p className="text-sm">
            Thank you for your patience. While you wait, you can play a quick
            game.
          </p>
          <div className="mt-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:opacity-90">
                  Play Snake
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[720px]">
                <DialogHeader>
                  <DialogTitle>Snake</DialogTitle>
                  <DialogDescription>
                    Use Arrow keys or WASD. Space to pause. Don’t hit the
                    walls—or yourself!
                  </DialogDescription>
                </DialogHeader>
                {/* Mount the game only when dialog open to avoid global listeners outside */}
                {open ? <SnakeGame /> : null}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </main>
  );
}
