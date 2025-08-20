"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import * as THREE from "three"

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Create floating particles with theme-aware colors
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 100
    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: resolvedTheme === "dark" ? 0x8b5cf6 : 0x4f46e5,
      transparent: true,
      opacity: resolvedTheme === "dark" ? 0.6 : 0.8,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Create geometric shapes with theme-aware colors
    const geometry = new THREE.TorusGeometry(1, 0.3, 16, 100)
    const material = new THREE.MeshBasicMaterial({
      color: resolvedTheme === "dark" ? 0x8b5cf6 : 0x667eea,
      wireframe: true,
      transparent: true,
      opacity: resolvedTheme === "dark" ? 0.15 : 0.1,
    })
    const torus = new THREE.Mesh(geometry, material)
    scene.add(torus)

    camera.position.z = 5

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      torus.rotation.x += 0.01
      torus.rotation.y += 0.01

      particlesMesh.rotation.y += 0.002

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [resolvedTheme])

  return <div ref={mountRef} className="absolute inset-0 -z-10" />
}
