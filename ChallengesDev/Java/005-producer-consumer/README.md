# Challenge 005: Producer-Consumer Pattern

## Problem Description
Implement the **Producer-Consumer** design pattern using a custom or existing `BlockingQueue`. The goal is for one or more "producer" threads to generate data and place it in a capacity-limited queue, while one or more "consumer" threads retrieve that data for processing. The system must correctly handle situations where the queue is full (producers wait) or empty (consumers wait).

## Input and Output Format
- **Classes**:
  - `Producer`: A thread that produces integers.
  - `Consumer`: A thread that consumes integers.
  - `DataBuffer`: The structure that acts as a synchronized queue.

## Constraints and Edge Cases
- Maximum queue capacity.
- Thread interruption handling.
- End-of-production signaling (poison pill).

## Usage Example
```java
DataBuffer<Integer> buffer = new DataBuffer<>(5);
Thread producer = new Thread(new Producer(buffer));
Thread consumer = new Thread(new Consumer(buffer));
```

## Key Concepts
- **Synchronization**: Use of `wait()` and `notifyAll()` or `Condition`.
- **Inter-thread Communication**: Safe data exchange between threads.
- **Backpressure**: What happens when production is faster than consumption.
