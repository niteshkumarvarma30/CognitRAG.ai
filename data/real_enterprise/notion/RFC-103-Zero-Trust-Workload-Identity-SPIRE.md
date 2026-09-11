# RFC-103: Zero-Trust Workload Identity with SPIFFE / SPIRE
Author: Elena Rostova, Security & Infrastructure
Status: Approved | Implementation: Q4 2024

## 1. Objective
Replace static AWS IAM access keys and long-lived database passwords with short-lived (1-hour) X.509 SVID credentials issued by SPIRE (SPIFFE Runtime Environment).

## 2. Core Components
- **SPIRE Server:** Runs as a high-availability StatefulSet backed by Supabase Postgres.
- **SPIRE Agent:** Deployed as a DaemonSet on every Kubernetes worker node.
- **Attestation:** Node attestation via AWS Instance Identity Document; Pod attestation via Kubernetes namespace and service account labels.

## 3. Security Invariants
- Zero static credentials stored in environment variables.
- Mutual TLS (mTLS) with automated X.509 rotation every 60 minutes.