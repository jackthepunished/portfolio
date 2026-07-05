---
title: "Making a pile of machines behave like one"
date: 2026-05-03
cover: "image1.png"
excerpt: "What it took to get brokkr, a REAPI v2 build grid in Rust, actually scheduling work across real machines instead of just one."
---

brokkr started as a question: what does it actually take to make several machines cooperate on one build, instead of each running the whole thing locally?

## REAPI as the contract

Remote Execution API v2 gives you the protocol for free — action digests, a content-addressable store, an execution service. What it doesn't give you is a scheduler that behaves well under real load, and that's most of what brokkr actually is.

## The scheduling problem

Every worker advertises capacity — CPU, memory, a platform string. Every incoming action declares what it needs. The naive version is a queue and a match function, and that's roughly where I started. It falls apart the moment workers are heterogeneous and jobs vary wildly in size: a few large jobs monopolize the fast workers while a queue of small jobs starves behind them.

What's working better right now is a weighted fair-share scheduler — track recent throughput per client, bias free workers toward whoever's been starved longest. It's not perfect but it's a large step up from FIFO.

## Content-addressable storage, sharp edges included

The CAS is the part that made the whole system feel real — once inputs and outputs are hashed and deduplicated, workers can pull only what they're missing and the network traffic drops off a cliff. The sharp edge: cache invalidation isn't the hard part, garbage collection under concurrent writes is. I'm still not fully happy with how brokkr reclaims space from a CAS that workers are actively reading from mid-build.

More on that once I've actually solved it instead of worked around it.
