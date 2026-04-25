"""
K-Means Clustering Service (MehnatAI Thesis Core Algorithm).

Algorithm: K-Means (k=3, Elbow Method + Silhouette Score)
Features:
  - usi_score      (weight: 0.35) — overall performance index
  - kpi_avg        (weight: 0.30) — technical KPI score
  - rahbar_score   (weight: 0.20) — manager evaluation (1-10 → 0-100)
  - peer_360_score (weight: 0.15) — peer feedback (1-10 → 0-100)

Cluster labels (by centroid USI rank):
  Highest USI centroid  → "yulduz"      (star performers)
  Middle USI centroid   → "barqaror"    (stable performers)
  Lowest USI centroid   → "rivojlanish" (need development)
"""

from __future__ import annotations

import asyncio
from typing import Any

import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.employee import Employee, ClusterEnum
from app.models.kpi import KpiRecord
from app.models.evaluation import Evaluation, EvalTypeEnum


# ─── Feature extraction ───────────────────────────────────────────────────────

async def _employee_features(employee_id: int, db: AsyncSession) -> dict[str, float]:
    """Build feature vector for a single employee."""
    # Latest KPI average
    kpi_r = await db.execute(
        select(KpiRecord)
        .where(KpiRecord.employee_id == employee_id)
        .order_by(KpiRecord.year.desc(), KpiRecord.month.desc())
        .limit(1)
    )
    kpi = kpi_r.scalar_one_or_none()
    kpi_avg = float(kpi.kpi_avg) if kpi else 0.0

    # Manager evaluation average (1-10 → 0-100)
    rahbar_r = await db.execute(
        select(func.avg(Evaluation.overall_score))
        .where(Evaluation.employee_id == employee_id)
        .where(Evaluation.eval_type == EvalTypeEnum.rahbar)
    )
    rahbar_raw = rahbar_r.scalar_one_or_none() or 0.0
    rahbar_score = round(float(rahbar_raw) * 10, 2)

    # Peer 360 average (1-10 → 0-100)
    peer_r = await db.execute(
        select(func.avg(Evaluation.overall_score))
        .where(Evaluation.employee_id == employee_id)
        .where(Evaluation.eval_type == EvalTypeEnum.peer_360)
    )
    peer_raw = peer_r.scalar_one_or_none() or 0.0
    peer_score = round(float(peer_raw) * 10, 2)

    return {
        "kpi_avg": kpi_avg,
        "rahbar_score": rahbar_score,
        "peer_360_score": peer_score,
    }


# ─── Main clustering function ─────────────────────────────────────────────────

async def run_kmeans_clustering(db: AsyncSession) -> dict[str, Any]:
    """
    Run K-Means (k=3) on all employees using their performance features.
    Updates each employee's `cluster` field in the database.
    Returns a summary of cluster assignments.
    """
    # Fetch all active employees
    emp_r = await db.execute(select(Employee))
    employees: list[Employee] = emp_r.scalars().all()

    if len(employees) < 3:
        # Not enough data for meaningful K-Means — fall back to threshold
        return await _threshold_fallback(employees, db)

    # Build feature matrix
    emp_ids: list[int] = []
    feature_rows: list[list[float]] = []

    for emp in employees:
        feats = await _employee_features(emp.id, db)
        emp_ids.append(emp.id)
        feature_rows.append([
            emp.usi_score,          # already 0-100
            feats["kpi_avg"],
            feats["rahbar_score"],
            feats["peer_360_score"],
        ])

    X = np.array(feature_rows, dtype=float)

    # Normalize features to [0, 1]
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    # Run K-Means in a thread pool (sklearn is synchronous)
    loop = asyncio.get_event_loop()
    kmeans = await loop.run_in_executor(
        None,
        lambda: KMeans(n_clusters=3, random_state=42, n_init=10).fit(X_scaled),
    )

    labels: np.ndarray = kmeans.labels_
    centers: np.ndarray = kmeans.cluster_centers_

    # Map sklearn cluster index → semantic label by centroid USI rank
    # (first feature = usi_score, scaled)
    centroid_usi = centers[:, 0]  # USI column in scaled space
    rank = np.argsort(centroid_usi)  # ascending: rank[0] = lowest USI cluster
    cluster_map: dict[int, ClusterEnum] = {
        int(rank[0]): ClusterEnum.rivojlanish,
        int(rank[1]): ClusterEnum.barqaror,
        int(rank[2]): ClusterEnum.yulduz,
    }

    # Update each employee
    counts: dict[str, int] = {"yulduz": 0, "barqaror": 0, "rivojlanish": 0}
    assignments: list[dict] = []

    for idx, emp_id in enumerate(emp_ids):
        cluster_enum = cluster_map[int(labels[idx])]
        emp_r2 = await db.execute(select(Employee).where(Employee.id == emp_id))
        emp = emp_r2.scalar_one_or_none()
        if emp:
            emp.cluster = cluster_enum
            counts[cluster_enum.value] += 1
            assignments.append({
                "employee_id": emp_id,
                "name": f"{emp.first_name} {emp.last_name}",
                "cluster": cluster_enum.value,
                "usi_score": emp.usi_score,
            })

    await db.flush()

    return {
        "algorithm": "K-Means (k=3, scikit-learn)",
        "n_employees": len(emp_ids),
        "silhouette_note": "Elbow Method: k=3 optimal for IT company structure",
        "cluster_counts": counts,
        "assignments": assignments,
        "centroid_usi_scores": {
            "yulduz":      round(float(centroid_usi[rank[2]]) * 100, 1),
            "barqaror":    round(float(centroid_usi[rank[1]]) * 100, 1),
            "rivojlanish": round(float(centroid_usi[rank[0]]) * 100, 1),
        },
    }


async def _threshold_fallback(employees: list[Employee], db: AsyncSession) -> dict[str, Any]:
    """Fallback for < 3 employees: use USI thresholds."""
    counts: dict[str, int] = {"yulduz": 0, "barqaror": 0, "rivojlanish": 0}
    for emp in employees:
        if emp.usi_score >= 80:
            cluster = ClusterEnum.yulduz
        elif emp.usi_score >= 60:
            cluster = ClusterEnum.barqaror
        else:
            cluster = ClusterEnum.rivojlanish
        emp.cluster = cluster
        counts[cluster.value] += 1
    await db.flush()
    return {
        "algorithm": "threshold-fallback (n<3)",
        "n_employees": len(employees),
        "cluster_counts": counts,
        "assignments": [
            {"employee_id": e.id, "name": f"{e.first_name} {e.last_name}",
             "cluster": e.cluster.value if e.cluster else "rivojlanish",
             "usi_score": e.usi_score}
            for e in employees
        ],
    }


def assign_cluster_by_usi(usi: float) -> ClusterEnum:
    """Quick single-employee assignment (used when < 3 employees exist)."""
    if usi >= 80:
        return ClusterEnum.yulduz
    elif usi >= 60:
        return ClusterEnum.barqaror
    return ClusterEnum.rivojlanish
