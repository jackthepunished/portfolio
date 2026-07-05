---
title: "Building a deferred renderer from nothing"
date: 2026-06-12
cover: "image.png"
excerpt: "Notes on getting horizon-engine's Vulkan deferred pipeline off the ground — G-buffers, the lighting pass, and the bugs in between."
---

I've been heads-down on horizon-engine's renderer for the last few weeks, and I wanted to write down where it's at before I forget how any of it works.

## Why deferred

Forward rendering falls over fast once you want more than a handful of lights — every light needs a full pass over every fragment. Deferred flips that: write geometry data once into a G-buffer (position, normal, albedo, roughness/metallic), then run lighting as a screen-space pass over just the pixels that are actually visible. More lights stop being expensive.

The tradeoff is memory bandwidth and transparency — deferred handles opaque geometry beautifully and fights you on anything translucent. I'm punting on that for now with a forward pass tacked on afterward for the few transparent objects that exist.

## The G-buffer layout

Four render targets, right now:

- RGBA16F — world-space position
- RGBA8 — packed normal
- RGBA8 — albedo + roughness
- RGBA8 — metallic + AO

That's more bandwidth than I'd like. The next pass is reconstructing position from depth instead of storing it directly, which should shave one full render target off the bandwidth cost.

## What actually broke

The nastiest bug was a lighting pass that looked *almost* right — shadows in roughly the correct place, but every normal seemed rotated slightly off-axis. Turned out I was packing normals into the G-buffer in view space but unpacking them in the lighting shader as if they were world space. A one-line fix, three hours of staring at a debug view before I found it.

That's the job, though. It clicks eventually.
