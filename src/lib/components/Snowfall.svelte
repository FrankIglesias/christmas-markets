<script lang="ts">
  interface Flake {
    x: number
    y: number
    radius: number
    speed: number
    drift: number
    phase: number
    opacity: number
  }

  let canvas: HTMLCanvasElement | undefined = $state()

  const FLAKES = 140

  function makeFlake(width: number, height: number, anywhere: boolean): Flake {
    return {
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : -10,
      radius: 1 + Math.random() * 2.6,
      speed: 0.4 + Math.random() * 1.2,
      drift: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.35 + Math.random() * 0.55,
    }
  }

  $effect(() => {
    const el = canvas
    if (!el) return

    const ctx = el.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = window.innerWidth
    let height = window.innerHeight
    let flakes: Flake[] = []

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = window.devicePixelRatio || 1
      el!.width = Math.floor(width * dpr)
      el!.height = Math.floor(height * dpr)
      el!.style.width = `${width}px`
      el!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      flakes = Array.from({ length: FLAKES }, () => makeFlake(width, height, true))
    }

    resize()

    let raf = 0
    let time = 0

    function draw() {
      ctx!.clearRect(0, 0, width, height)
      ctx!.fillStyle = '#ffffff'

      if (!reduceMotion) time += 0.01

      for (const flake of flakes) {
        ctx!.globalAlpha = flake.opacity
        ctx!.beginPath()
        ctx!.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        ctx!.fill()

        if (reduceMotion) continue

        flake.y += flake.speed
        flake.x += Math.sin(time + flake.phase) * flake.drift * 0.5 + 0.15

        if (flake.y - flake.radius > height) {
          Object.assign(flake, makeFlake(width, height, false))
        }
        if (flake.x - flake.radius > width) flake.x = -flake.radius
        else if (flake.x + flake.radius < 0) flake.x = width + flake.radius
      }

      ctx!.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  })
</script>

<canvas bind:this={canvas} class="snowfall" aria-hidden="true"></canvas>

<style>
  .snowfall {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 900;
  }
</style>
