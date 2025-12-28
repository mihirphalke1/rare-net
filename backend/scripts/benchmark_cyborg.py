"""
CyborgDB Performance Benchmark
==============================
This script stress-tests the local CyborgDB instance to validate performance claims.
It measures:
1. Write Latency (Upsert)
2. Read Latency (Search)
3. Throughput (ops/sec)

Usage:
    python benchmark_cyborg.py
"""

import sys
import os
import time
import statistics
import random
from typing import List

# Add parent dir to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.cyborg_service import cyborg_service

def generate_random_vector(dim=384) -> List[float]:
    return [random.random() for _ in range(dim)]

def run_benchmark():
    print(f"{'='*60}")
    print(f"🚀 CYBORGDB PERFORMANCE BENCHMARK")
    print(f"{'='*60}")
    print("Configuration:")
    print(f"  - Vectors: 100 (Write) / 1000 (Read)")
    print(f"  - Dimension: 384")
    print(f"  - Index: rarenet_benchmark_test")
    print("-" * 60)

    # 1. Setup
    print("\n[1/3] Setting up benchmark index...")
    # Using a temp index to not mess up production data
    index_name = "rarenet_benchmark_test"
    try:
        if index_name in cyborg_service.client.list_indexes():
            print(f"  - Index {index_name} exists, using it.")
        else:
            cyborg_service.client.create_index(index_name, index_key=cyborg_service.demo_key)
            print(f"  - Created {index_name}")
    except Exception as e:
        print(f"  ! Error: {e}")
        return

    # 2. Write Latency
    print("\n[2/3] Benchmarking WRITE (Upsert)...")
    write_latencies = []
    
    # Load index wrapper
    index = cyborg_service.client.load_index(index_name, index_key=cyborg_service.demo_key)
    
    for i in range(50):
        vec = generate_random_vector()
        item = {
            "id": f"bench_{i}",
            "vector": vec,
            "metadata": {"type": "benchmark"}
        }
        
        start = time.perf_counter()
        index.upsert([item])
        end = time.perf_counter()
        
        write_latencies.append((end - start) * 1000) # ms
        if i % 10 == 0:
            print(f"  - Processed {i}/50 writes...", end="\r")

    avg_write = statistics.mean(write_latencies)
    p95_write = statistics.quantiles(write_latencies, n=20)[18] # 95th percentile
    print(f"  ✅ WRITE RESULTS:")
    print(f"     Average: {avg_write:.2f} ms")
    print(f"     P95:     {p95_write:.2f} ms")
    print(f"     Rate:    {1000/avg_write:.1f} ops/sec")

    # 3. Read Latency
    print("\n[3/3] Benchmarking READ (Query)...")
    read_latencies = []
    
    # Ensure connections are warm
    query_vec = generate_random_vector()
    
    for i in range(200):
        start = time.perf_counter()
        # Query existing data
        index.query(query_vec, top_k=5)
        end = time.perf_counter()
        
        read_latencies.append((end - start) * 1000) # ms
        if i % 50 == 0:
            print(f"  - Processed {i}/200 reads...", end="\r")

    avg_read = statistics.mean(read_latencies)
    p95_read = statistics.quantiles(read_latencies, n=20)[18] # 95th percentile
    min_read = min(read_latencies)

    print(f"  ✅ READ RESULTS:")
    print(f"     Average: {avg_read:.2f} ms")
    print(f"     Min:     {min_read:.2f} ms")
    print(f"     P95:     {p95_read:.2f} ms")
    print(f"     Rate:    {1000/avg_read:.1f} ops/sec")

    print(f"\n{'='*60}")
    print(f"SUMMARY: CyborgDB is delivering {avg_read:.2f}ms read latency.")
    print(f"{'='*60}")

if __name__ == "__main__":
    run_benchmark()
